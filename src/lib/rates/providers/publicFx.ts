import { Rate, RatesBundle, ProviderResult } from '../types'

// Multiple public FX sources for better reliability
const FX_SOURCES = [
  {
    name: 'ExchangeRate.host',
    url: 'https://api.exchangerate.host/latest?base=USD&symbols=COP,EUR',
    requiresKey: false
  },
  {
    name: 'Fixer.io',
    url: 'https://api.fixer.io/latest?base=USD&symbols=COP,EUR',
    requiresKey: false
  },
  {
    name: 'CurrencyAPI',
    url: 'https://api.currencyapi.com/v3/latest?base_currency=USD&currencies=COP,EUR',
    requiresKey: true
  },
  {
    name: 'OpenExchangeRates',
    url: 'https://openexchangerates.org/api/latest.json?base=USD&symbols=COP,EUR',
    requiresKey: true
  }
]

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          ...options.headers
        }
      })
      
      if (response.ok) {
        return response
      }
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
    }
  }
  throw new Error('All retry attempts failed')
}

function parseFxResponse(data: any, source: string): Partial<RatesBundle> {
  const rates: Partial<RatesBundle> = {}
  
  try {
    // Handle different response formats
    let usdCopRate: number | null = null
    let eurUsdRate: number | null = null
    
    if (source === 'ExchangeRate.host') {
      if (data.rates?.COP) usdCopRate = data.rates.COP
      if (data.rates?.EUR) eurUsdRate = data.rates.EUR
    } else if (source === 'Fixer.io') {
      if (data.rates?.COP) usdCopRate = data.rates.COP
      if (data.rates?.EUR) eurUsdRate = data.rates.EUR
    } else if (source === 'CurrencyAPI') {
      if (data.data?.COP?.value) usdCopRate = data.data.COP.value
      if (data.data?.EUR?.value) eurUsdRate = data.data.EUR.value
    } else if (source === 'OpenExchangeRates') {
      if (data.rates?.COP) usdCopRate = data.rates.COP
      if (data.rates?.EUR) eurUsdRate = data.rates.EUR
    }
    
    // Add USD-COP rate
    if (usdCopRate && usdCopRate > 0) {
      rates['USD-COP'] = {
        base: 'USD',
        quote: 'COP',
        value: usdCopRate,
        provider: source,
        at: data.date || new Date().toISOString()
      }
      
      rates['COP-USD'] = {
        base: 'COP',
        quote: 'USD',
        value: 1 / usdCopRate,
        provider: source,
        at: data.date || new Date().toISOString()
      }
    }
    
    // Add EUR-USD rate (if not already available from Frankfurter)
    if (eurUsdRate && eurUsdRate > 0) {
      rates['EUR-USD'] = {
        base: 'EUR',
        quote: 'USD',
        value: eurUsdRate,
        provider: source,
        at: data.date || new Date().toISOString()
      }
      
      rates['USD-EUR'] = {
        base: 'USD',
        quote: 'EUR',
        value: 1 / eurUsdRate,
        provider: source,
        at: data.date || new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.warn(`Failed to parse ${source} response:`, error)
  }
  
  return rates
}

export async function getPublicFxRates(): Promise<ProviderResult> {
  const allRates: Rate[] = []
  const errors: string[] = []
  const apiKey = process.env.PUBLIC_FX_API_KEY
  
  // Try multiple sources in parallel
  const sourcePromises = FX_SOURCES.map(async (source) => {
    // Skip sources that require API key if we don't have one
    if (source.requiresKey && !apiKey) {
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
      if (source.requiresKey && apiKey) {
        if (source.name === 'CurrencyAPI') {
          url = `${source.url}&apikey=${apiKey}`
        } else if (source.name === 'OpenExchangeRates') {
          url = `${source.url}&app_id=${apiKey}`
        }
      }
      
      const response = await fetchWithRetry(url, {
        next: { revalidate: 3600 }
      })
      
      const data = await response.json()
      const rates = parseFxResponse(data, source.name)
      
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
      provider: 'PublicFX-Multiple',
      success: false,
      error: `All sources failed: ${errors.join(', ')}`
    }
  }
  
  // Average rates from multiple sources
  const averagedRates: Partial<RatesBundle> = {}
  
  // Group rates by currency pair
  const usdCopRates = allRates.filter(r => r.base === 'USD' && r.quote === 'COP')
  const eurUsdRates = allRates.filter(r => r.base === 'EUR' && r.quote === 'USD')
  
  if (usdCopRates.length > 0) {
    const avgUsdCop = usdCopRates.reduce((sum, r) => sum + r.value, 0) / usdCopRates.length
    averagedRates['USD-COP'] = {
      base: 'USD',
      quote: 'COP',
      value: avgUsdCop,
      provider: `Average of ${usdCopRates.length} sources`,
      at: new Date().toISOString()
    }
    
    averagedRates['COP-USD'] = {
      base: 'COP',
      quote: 'USD',
      value: 1 / avgUsdCop,
      provider: `Average of ${usdCopRates.length} sources`,
      at: new Date().toISOString()
    }
  }
  
  if (eurUsdRates.length > 0) {
    const avgEurUsd = eurUsdRates.reduce((sum, r) => sum + r.value, 0) / eurUsdRates.length
    averagedRates['EUR-USD'] = {
      base: 'EUR',
      quote: 'USD',
      value: avgEurUsd,
      provider: `Average of ${eurUsdRates.length} sources`,
      at: new Date().toISOString()
    }
    
    averagedRates['USD-EUR'] = {
      base: 'USD',
      quote: 'EUR',
      value: 1 / avgEurUsd,
      provider: `Average of ${eurUsdRates.length} sources`,
      at: new Date().toISOString()
    }
  }
  
  return {
    rates: averagedRates,
    provider: 'PublicFX-Multiple',
    success: true
  }
}
