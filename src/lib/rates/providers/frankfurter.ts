import { Rate, RatesBundle, ProviderResult } from '../types'

export async function getFrankfurterRates(): Promise<ProviderResult> {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CurrencyConverter/1.0)',
      },
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      throw new Error(`Frankfurter API failed: ${response.status}`)
    }
    
    const data = await response.json()
    const rates: Partial<RatesBundle> = {}
    
    if (data.rates && data.rates.USD) {
      const eurUsdRate = data.rates.USD
      
      // EUR to USD
      rates['EUR-USD'] = {
        base: 'EUR',
        quote: 'USD',
        value: eurUsdRate,
        provider: 'Frankfurter',
        at: data.date || new Date().toISOString()
      }
      
      // USD to EUR (inverse)
      rates['USD-EUR'] = {
        base: 'USD',
        quote: 'EUR',
        value: 1 / eurUsdRate,
        provider: 'Frankfurter',
        at: data.date || new Date().toISOString()
      }
    }
    
    if (Object.keys(rates).length === 0) {
      throw new Error('No valid rates found in Frankfurter response')
    }
    
    return {
      rates,
      provider: 'Frankfurter',
      success: true
    }
    
  } catch (error) {
    console.error('Frankfurter provider error:', error)
    return {
      rates: {},
      provider: 'Frankfurter',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Frankfurter error'
    }
  }
}
