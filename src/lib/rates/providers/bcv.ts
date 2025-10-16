import { Rate, RatesBundle, ProviderResult } from '../types'

export async function getBCVRates(): Promise<ProviderResult> {
  try {
    // Try to fetch from BCV API first
    const apiUrl = process.env.BCV_ENDPOINT || 'https://www.bcv.org.ve/api/exchange'
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CurrencyConverter/1.0)',
        },
        next: { revalidate: 3600 }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Parse BCV API response format
        const rates: Partial<RatesBundle> = {}
        
        if (data.USD && data.USD.rate) {
          rates['USD-VES'] = {
            base: 'USD',
            quote: 'VES',
            value: parseFloat(data.USD.rate),
            provider: 'BCV',
            at: new Date().toISOString()
          }
        }
        
        if (data.EUR && data.EUR.rate) {
          rates['EUR-VES'] = {
            base: 'EUR',
            quote: 'VES',
            value: parseFloat(data.EUR.rate),
            provider: 'BCV',
            at: new Date().toISOString()
          }
        }
        
        if (Object.keys(rates).length > 0) {
          return {
            rates,
            provider: 'BCV',
            success: true
          }
        }
      }
    } catch (apiError) {
      console.warn('BCV API failed, trying HTML parsing:', apiError)
    }
    
    // Fallback: Parse BCV HTML page
    const htmlUrl = 'https://www.bcv.org.ve/'
    const response = await fetch(htmlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CurrencyConverter/1.0)',
      },
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`BCV HTML fetch failed: ${response.status}`)
    }
    
    const html = await response.text()
    const rates: Partial<RatesBundle> = {}
    
    // Parse USD rate from HTML
    const usdMatch = html.match(/USD\s*=\s*Bs\.?\s*([\d,\.]+)/i)
    if (usdMatch) {
      const usdRate = parseFloat(usdMatch[1].replace(/,/g, ''))
      if (!isNaN(usdRate) && usdRate > 0) {
        rates['USD-VES'] = {
          base: 'USD',
          quote: 'VES',
          value: usdRate,
          provider: 'BCV',
          at: new Date().toISOString()
        }
      }
    }
    
    // Parse EUR rate from HTML
    const eurMatch = html.match(/EUR\s*=\s*Bs\.?\s*([\d,\.]+)/i)
    if (eurMatch) {
      const eurRate = parseFloat(eurMatch[1].replace(/,/g, ''))
      if (!isNaN(eurRate) && eurRate > 0) {
        rates['EUR-VES'] = {
          base: 'EUR',
          quote: 'VES',
          value: eurRate,
          provider: 'BCV',
          at: new Date().toISOString()
        }
      }
    }
    
    if (Object.keys(rates).length === 0) {
      throw new Error('No valid rates found in BCV response')
    }
    
    return {
      rates,
      provider: 'BCV',
      success: true
    }
    
  } catch (error) {
    console.error('BCV provider error:', error)
    return {
      rates: {},
      provider: 'BCV',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown BCV error'
    }
  }
}
