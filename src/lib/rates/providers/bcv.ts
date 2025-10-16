import { Rate, RatesBundle, ProviderResult } from '../types'

// Alternative sources for VES rates
const VES_SOURCES = [
  {
    name: 'BCV Official',
    url: 'https://www.bcv.org.ve/',
    parseHtml: true
  },
  {
    name: 'DolarToday',
    url: 'https://dolartoday.com/',
    parseHtml: true
  },
  {
    name: 'Monitor Dolar',
    url: 'https://monitordolarvzla.com/',
    parseHtml: true
  }
]

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...options.headers
        }
      })
      
      if (response.ok) {
        return response
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('All retry attempts failed')
}

function parseVESFromHTML(html: string, source: string): Partial<RatesBundle> {
  const rates: Partial<RatesBundle> = {}
  
  // Multiple patterns to try for USD/VES
  const usdPatterns = [
    /USD\s*=\s*Bs\.?\s*([\d,\.]+)/i,
    /Dólar\s*=\s*Bs\.?\s*([\d,\.]+)/i,
    /USD\s*Bs\.?\s*([\d,\.]+)/i,
    /Dólar\s*Bs\.?\s*([\d,\.]+)/i,
    /1\s*USD\s*=\s*([\d,\.]+)\s*Bs/i,
    /1\s*Dólar\s*=\s*([\d,\.]+)\s*Bs/i
  ]
  
  for (const pattern of usdPatterns) {
    const match = html.match(pattern)
    if (match) {
      const rate = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(rate) && rate > 0 && rate < 1000000) { // Sanity check
        rates['USD-VES'] = {
          base: 'USD',
          quote: 'VES',
          value: rate,
          provider: source,
          at: new Date().toISOString()
        }
        break
      }
    }
  }
  
  // Multiple patterns for EUR/VES
  const eurPatterns = [
    /EUR\s*=\s*Bs\.?\s*([\d,\.]+)/i,
    /Euro\s*=\s*Bs\.?\s*([\d,\.]+)/i,
    /EUR\s*Bs\.?\s*([\d,\.]+)/i,
    /Euro\s*Bs\.?\s*([\d,\.]+)/i,
    /1\s*EUR\s*=\s*([\d,\.]+)\s*Bs/i,
    /1\s*Euro\s*=\s*([\d,\.]+)\s*Bs/i
  ]
  
  for (const pattern of eurPatterns) {
    const match = html.match(pattern)
    if (match) {
      const rate = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(rate) && rate > 0 && rate < 1000000) {
        rates['EUR-VES'] = {
          base: 'EUR',
          quote: 'VES',
          value: rate,
          provider: source,
          at: new Date().toISOString()
        }
        break
      }
    }
  }
  
  return rates
}

export async function getBCVRates(): Promise<ProviderResult> {
  const allRates: Rate[] = []
  const errors: string[] = []
  
  // Try multiple sources in parallel
  const sourcePromises = VES_SOURCES.map(async (source) => {
    try {
      const response = await fetchWithRetry(source.url, {
        next: { revalidate: 3600 }
      })
      
      const html = await response.text()
      const rates = parseVESFromHTML(html, source.name)
      
      return {
        source: source.name,
        rates: Object.values(rates),
        success: true
      }
    } catch (error) {
      console.warn(`${source.name} failed:`, error)
      return {
        source: source.name,
        rates: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  const results = await Promise.allSettled(sourcePromises)
  
  // Collect all successful rates
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      allRates.push(...result.value.rates)
    } else if (result.status === 'rejected') {
      errors.push(result.reason?.message || 'Unknown error')
    }
  })
  
  if (allRates.length === 0) {
    return {
      rates: {},
      provider: 'BCV-Multiple',
      success: false,
      error: `All sources failed: ${errors.join(', ')}`
    }
  }
  
  // Average rates from multiple sources
  const averagedRates: Partial<RatesBundle> = {}
  
  // Group rates by currency pair
  const usdVesRates = allRates.filter(r => r.base === 'USD' && r.quote === 'VES')
  const eurVesRates = allRates.filter(r => r.base === 'EUR' && r.quote === 'VES')
  
  if (usdVesRates.length > 0) {
    const avgUsdVes = usdVesRates.reduce((sum, r) => sum + r.value, 0) / usdVesRates.length
    averagedRates['USD-VES'] = {
      base: 'USD',
      quote: 'VES',
      value: avgUsdVes,
      provider: `Average of ${usdVesRates.length} sources`,
      at: new Date().toISOString()
    }
  }
  
  if (eurVesRates.length > 0) {
    const avgEurVes = eurVesRates.reduce((sum, r) => sum + r.value, 0) / eurVesRates.length
    averagedRates['EUR-VES'] = {
      base: 'EUR',
      quote: 'VES',
      value: avgEurVes,
      provider: `Average of ${eurVesRates.length} sources`,
      at: new Date().toISOString()
    }
  }
  
  return {
    rates: averagedRates,
    provider: 'BCV-Multiple',
    success: true
  }
}
