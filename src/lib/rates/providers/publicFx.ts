import { Rate, RatesBundle, ProviderResult } from '../types'

export async function getPublicFxRates(): Promise<ProviderResult> {
  try {
    const apiKey = process.env.PUBLIC_FX_API_KEY
    let rates: Partial<RatesBundle> = {}
    
    // Try exchangerate.host first (no API key required)
    try {
      const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=COP', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CurrencyConverter/1.0)',
        },
        next: { revalidate: 3600 }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.rates && data.rates.COP) {
          const usdCopRate = data.rates.COP
          
          rates['USD-COP'] = {
            base: 'USD',
            quote: 'COP',
            value: usdCopRate,
            provider: 'ExchangeRate.host',
            at: data.date || new Date().toISOString()
          }
          
          rates['COP-USD'] = {
            base: 'COP',
            quote: 'USD',
            value: 1 / usdCopRate,
            provider: 'ExchangeRate.host',
            at: data.date || new Date().toISOString()
          }
        }
      }
    } catch (error) {
      console.warn('ExchangeRate.host failed:', error)
    }
    
    // If we have an API key, try other services for better coverage
    if (apiKey && Object.keys(rates).length === 0) {
      // Try OpenExchangeRates
      try {
        const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD&symbols=COP`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CurrencyConverter/1.0)',
          },
          next: { revalidate: 3600 }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.rates && data.rates.COP) {
            const usdCopRate = data.rates.COP
            
            rates['USD-COP'] = {
              base: 'USD',
              quote: 'COP',
              value: usdCopRate,
              provider: 'OpenExchangeRates',
              at: new Date().toISOString()
            }
            
            rates['COP-USD'] = {
              base: 'COP',
              quote: 'USD',
              value: 1 / usdCopRate,
              provider: 'OpenExchangeRates',
              at: new Date().toISOString()
            }
          }
        }
      } catch (error) {
        console.warn('OpenExchangeRates failed:', error)
      }
    }
    
    if (Object.keys(rates).length === 0) {
      throw new Error('No public FX rates available')
    }
    
    return {
      rates,
      provider: 'PublicFX',
      success: true
    }
    
  } catch (error) {
    console.error('Public FX provider error:', error)
    return {
      rates: {},
      provider: 'PublicFX',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Public FX error'
    }
  }
}
