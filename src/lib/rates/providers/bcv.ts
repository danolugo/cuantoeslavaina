import { Rate, RatesBundle, ProviderResult } from '../types'
import { fetchWithProviderHandling } from '../fetcher'
import { ProviderError } from '../errors'

// Official source for VES rates
const VES_SOURCES = [
  {
    name: 'BCV Official',
    url: 'https://www.bcv.org.ve/',
    parseHtml: true
  }
]


function parseVESFromHTML(html: string, source: string): Partial<RatesBundle> {
  const rates: Partial<RatesBundle> = {}

  // Try robust patterns that span across their messy divs
  const usdPatterns = [
    /USD[\s\S]*?(?:>|\s)+?([\d,]+,\d+)/i,
    /Dólar[\s\S]*?(?:>|\s)+?([\d,]+,\d+)/i,
    /USD\s*=\s*Bs\.?\s*([\d,\.]+)/i
  ]

  for (const pattern of usdPatterns) {
    const match = html.match(pattern)
    if (match) {
      // Replace comma with dot for JS parsing, remove any existing dots used as thousands separators if necessary
      const cleanString = match[1].replace(/\./g, '').replace(',', '.')
      const rate = parseFloat(cleanString)

      if (!isNaN(rate) && rate > 0 && rate < 10000) { // Sanity check
        rates['USD-VES_OFFICIAL'] = {
          base: 'USD',
          quote: 'VES',
          value: rate,
          provider: source,
          at: new Date().toISOString(),
          rateType: 'official'
        }
        break
      }
    }
  }

  // Multiple patterns for EUR/VES
  const eurPatterns = [
    /EUR[\s\S]*?(?:>|\s)+?([\d,]+,\d+)/i,
    /Euro[\s\S]*?(?:>|\s)+?([\d,]+,\d+)/i,
    /EUR\s*=\s*Bs\.?\s*([\d,\.]+)/i
  ]

  for (const pattern of eurPatterns) {
    const match = html.match(pattern)
    if (match) {
      const cleanString = match[1].replace(/\./g, '').replace(',', '.')
      const rate = parseFloat(cleanString)

      if (!isNaN(rate) && rate > 0 && rate < 10000) {
        rates['EUR-VES_OFFICIAL'] = {
          base: 'EUR',
          quote: 'VES',
          value: rate,
          provider: source,
          at: new Date().toISOString(),
          rateType: 'official'
        }
        break
      }
    }
  }

  return rates
}

export async function getBCVRates(requestId: string): Promise<ProviderResult> {
  const allRates: Rate[] = []
  const errors: string[] = []

  // Try multiple sources in parallel
  const sourcePromises = VES_SOURCES.map(async (source) => {
    try {
      const https = require('https')
      const agent = new https.Agent({ rejectUnauthorized: false })

      const html = await new Promise<string>((resolve, reject) => {
        const req = https.get(source.url, {
          agent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          }
        }, (res: any) => {
          if (res.statusCode !== 200) {
            reject(new ProviderError(`HTTP ${res.statusCode} from ${source.url}`, 'NETWORK', source.name, res.statusCode))
            return
          }
          let data = ''
          res.on('data', (chunk: string) => data += chunk)
          res.on('end', () => resolve(data))
        })

        req.on('error', (e: Error) => reject(e))
        req.setTimeout(8000, () => {
          req.destroy()
          reject(new ProviderError('Timeout', 'NETWORK', source.name))
        })
      })
      const rates = parseVESFromHTML(html, source.name)

      if (Object.keys(rates).length === 0) {
        throw new ProviderError(`Failed to parse HTML from ${source.name}`, 'PARSE', source.name)
      }

      return {
        source: source.name,
        rates: Object.values(rates),
        success: true
      }
    } catch (error) {
      if (error instanceof ProviderError) {
        console.warn(`[${requestId}] ${source.name} failed (${error.code}):`, error.message)
      } else {
        console.warn(`[${requestId}] ${source.name} failed:`, error)
      }
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
    averagedRates['USD-VES_OFFICIAL'] = {
      base: 'USD',
      quote: 'VES',
      value: usdVesRates[0].value,
      provider: usdVesRates[0].provider,
      at: new Date().toISOString(),
      rateType: 'official'
    }
  }

  if (eurVesRates.length > 0) {
    const avgEurVes = eurVesRates.reduce((sum, r) => sum + r.value, 0) / eurVesRates.length
    averagedRates['EUR-VES_OFFICIAL'] = {
      base: 'EUR',
      quote: 'VES',
      value: eurVesRates[0].value,
      provider: eurVesRates[0].provider,
      at: new Date().toISOString(),
      rateType: 'official'
    }
  }

  return {
    rates: averagedRates,
    provider: 'BCV-Multiple',
    success: true
  }
}
