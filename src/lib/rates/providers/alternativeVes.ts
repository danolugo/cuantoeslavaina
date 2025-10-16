import { Rate, RatesBundle, ProviderResult } from '../types'

// Alternative sources for VES rates that might work better
const ALTERNATIVE_VES_SOURCES = [
  {
    name: 'XE.com',
    url: 'https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=VES',
    parseHtml: true
  },
  {
    name: 'Wise.com',
    url: 'https://wise.com/us/currency-converter/usd-to-ves-rate',
    parseHtml: true
  },
  {
    name: 'CurrencyAPI',
    url: 'https://api.currencyapi.com/v3/latest?base_currency=USD&currencies=VES',
    parseHtml: false
  }
]

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    // XE.com patterns
    /1\s*USD\s*=\s*([\d,\.]+)\s*VES/i,
    /USD\s*to\s*VES[^>]*>([\d,\.]+)</i,
    // Wise.com patterns
    /1\s*US\s*dollar\s*=\s*([\d,\.]+)\s*VES/i,
    /USD\s*to\s*VES[^>]*>([\d,\.]+)</i,
    // Generic patterns
    /USD\s*=\s*([\d,\.]+)\s*VES/i,
    /1\s*USD\s*=\s*([\d,\.]+)\s*Bolívar/i,
    /Dólar\s*=\s*([\d,\.]+)\s*Bolívar/i
  ]
  
  for (const pattern of usdPatterns) {
    const match = html.match(pattern)
    if (match) {
      const rate = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(rate) && rate > 50 && rate < 1000) { // Sanity check for reasonable range
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
  
  return rates
}

function parseVESFromJSON(data: any, source: string): Partial<RatesBundle> {
  const rates: Partial<RatesBundle> = {}
  
  try {
    let usdVesRate: number | null = null
    
    if (source === 'CurrencyAPI') {
      if (data.data?.VES?.value) {
        usdVesRate = data.data.VES.value
      }
    }
    
    if (usdVesRate && usdVesRate > 50 && usdVesRate < 1000) {
      rates['USD-VES'] = {
        base: 'USD',
        quote: 'VES',
        value: usdVesRate,
        provider: source,
        at: data.meta?.last_updated_at || new Date().toISOString()
      }
    }
  } catch (error) {
    console.warn(`Failed to parse ${source} JSON response:`, error)
  }
  
  return rates
}

export async function getAlternativeVESRates(): Promise<ProviderResult> {
  const allRates: Rate[] = []
  const errors: string[] = []
  const apiKey = process.env.PUBLIC_FX_API_KEY
  
  // Try multiple sources in parallel
  const sourcePromises = ALTERNATIVE_VES_SOURCES.map(async (source) => {
    // Skip sources that require API key if we don't have one
    if (source.name === 'CurrencyAPI' && !apiKey) {
      return {
        source: source.name,
        rates: [],
        success: false,
        error: 'API key required but not provided'
      }
    }
    
    try {
      let url = source.url
      
      // Add API key to URL if required
      if (source.name === 'CurrencyAPI' && apiKey) {
        url = `${source.url}&apikey=${apiKey}`
      }
      
      const response = await fetchWithRetry(url, {
        next: { revalidate: 3600 }
      })
      
      if (source.parseHtml) {
        const html = await response.text()
        const rates = parseVESFromHTML(html, source.name)
        return {
          source: source.name,
          rates: Object.values(rates),
          success: Object.keys(rates).length > 0
        }
      } else {
        const data = await response.json()
        const rates = parseVESFromJSON(data, source.name)
        return {
          source: source.name,
          rates: Object.values(rates),
          success: Object.keys(rates).length > 0
        }
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
    if (result.status === 'fulfilled' && result.value.success && result.value.rates) {
      const ratesArray = Object.values(result.value.rates).filter((rate): rate is Rate => rate !== undefined)
      allRates.push(...ratesArray)
    } else if (result.status === 'rejected') {
      errors.push(result.reason?.message || 'Unknown error')
    }
  })
  
  if (allRates.length === 0) {
    return {
      rates: {},
      provider: 'Alternative-VES',
      success: false,
      error: `All sources failed: ${errors.join(', ')}`
    }
  }
  
  // Average rates from multiple sources
  const averagedRates: Partial<RatesBundle> = {}
  
  const usdVesRates = allRates.filter(r => r.base === 'USD' && r.quote === 'VES')
  
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
  
  return {
    rates: averagedRates,
    provider: 'Alternative-VES',
    success: true
  }
}
