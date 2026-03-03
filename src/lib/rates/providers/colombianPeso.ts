import { Rate, RatesBundle, ProviderResult } from '../types'
import { fetchWithProviderHandling } from '../fetcher'
import { ProviderError } from '../errors'

// Simplified Colombian Peso provider with reliable sources
export async function getColombianPesoRates(requestId: string): Promise<ProviderResult> {
  console.log('ColombianPeso: Starting COP rate fetch...')

  try {
    // Try ExchangeRate-API (Open Tier) which doesn't require an API key
    const response = await fetchWithProviderHandling(`https://open.er-api.com/v6/latest/USD`, 'ExchangeRate-API', requestId, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    const data = await response.json()
    console.log(`[${requestId}] ColombianPeso: ExchangeRate-API response:`, data)

    if (data.rates?.COP) {
      const usdCopRate = data.rates.COP
      const rates: Partial<RatesBundle> = {
        'USD-COP': {
          base: 'USD',
          quote: 'COP',
          value: usdCopRate,
          provider: 'ExchangeRate-API',
          at: new Date(data.time_last_update_unix * 1000).toISOString()
        },
        'COP-USD': {
          base: 'COP',
          quote: 'USD',
          value: 1 / usdCopRate,
          provider: 'ExchangeRate-API',
          at: new Date(data.time_last_update_unix * 1000).toISOString()
        }
      }

      console.log(`[${requestId}] ColombianPeso: Successfully got COP rates:`, rates)
      return {
        rates,
        provider: 'ExchangeRate-API',
        success: true
      }
    }

    throw new ProviderError('Failed to parse COP rates', 'PARSE', 'ExchangeRate-API')

  } catch (error) {
    if (error instanceof ProviderError) {
      console.warn(`[${requestId}] ColombianPeso provider failed (${error.code}):`, error.message)
    } else {
      console.error(`[${requestId}] ColombianPeso: All sources failed:`, error)
    }

    console.log(`[${requestId}] ColombianPeso: Using fallback rates (4200.0)`)

    // Fallback: Use a reasonable current rate
    const fallbackRate = 4200.0
    const rates: Partial<RatesBundle> = {
      'USD-COP': {
        base: 'USD',
        quote: 'COP',
        value: fallbackRate,
        provider: 'Fallback',
        at: new Date().toISOString(),
        confidence: 'low'
      },
      'COP-USD': {
        base: 'COP',
        quote: 'USD',
        value: 1 / fallbackRate,
        provider: 'Fallback',
        at: new Date().toISOString(),
        confidence: 'low'
      }
    }

    return {
      rates,
      provider: 'Fallback',
      success: true
    }
  }
}