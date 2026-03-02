import { Rate, RatesBundle, ProviderResult } from '../types'
import { fetchWithProviderHandling } from '../fetcher'
import { ProviderError } from '../errors'

export async function getFrankfurterRates(requestId: string): Promise<ProviderResult> {
  try {
    const response = await fetchWithProviderHandling('https://api.frankfurter.app/latest?from=EUR&to=USD', 'Frankfurter', requestId, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CurrencyConverter/1.0)',
      },
      next: { revalidate: 3600 }
    })

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
      throw new ProviderError('No valid rates found in Frankfurter response', 'PARSE', 'Frankfurter')
    }

    return {
      rates,
      provider: 'Frankfurter',
      success: true
    }

  } catch (error) {
    if (error instanceof ProviderError) {
      console.warn(`[${requestId}] Frankfurter provider error (${error.code}):`, error.message)
    } else {
      console.error(`[${requestId}] Frankfurter provider error:`, error)
    }
    return {
      rates: {},
      provider: 'Frankfurter',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Frankfurter error'
    }
  }
}
