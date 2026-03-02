import { Rate, RatesBundle, ProviderResult } from '../types'
import { fetchWithProviderHandling } from '../fetcher'
import { ProviderError } from '../errors'

// Simplified Colombian Peso provider with reliable sources
export async function getColombianPesoRates(requestId: string): Promise<ProviderResult> {
  console.log('ColombianPeso: Starting COP rate fetch...')

  const apiKey = process.env.EXCHANGE_RATE_API_KEY || process.env.PUBLIC_FX_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: EXCHANGE_RATE_API_KEY or PUBLIC_FX_API_KEY environment variable is required in production')
    } else {
      console.warn('WARNING: API key is missing. Disabling ExchangeRate.host provider in development.')
      return {
        rates: {
          'USD-COP': { base: 'USD', quote: 'COP', value: 4200.0, provider: 'Fallback-Disabled', at: new Date().toISOString() },
          'COP-USD': { base: 'COP', quote: 'USD', value: 1 / 4200.0, provider: 'Fallback-Disabled', at: new Date().toISOString() }
        },
        provider: 'ExchangeRate.host-Disabled',
        success: false,
        error: 'Disabled in dev due to missing API key'
      }
    }
  }

  try {
    // Try ExchangeRate.host first (requires API key)
    const response = await fetchWithProviderHandling(`https://api.exchangerate.host/latest?base=USD&symbols=COP&access_key=${apiKey}`, 'ExchangeRate.host', requestId, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    const data = await response.json()
    console.log(`[${requestId}] ColombianPeso: ExchangeRate.host response:`, data)

    if (data.rates?.COP) {
      const usdCopRate = data.rates.COP
      const rates: Partial<RatesBundle> = {
        'USD-COP': {
          base: 'USD',
          quote: 'COP',
          value: usdCopRate,
          provider: 'ExchangeRate.host',
          at: data.date || new Date().toISOString()
        },
        'COP-USD': {
          base: 'COP',
          quote: 'USD',
          value: 1 / usdCopRate,
          provider: 'ExchangeRate.host',
          at: data.date || new Date().toISOString()
        }
      }

      console.log(`[${requestId}] ColombianPeso: Successfully got COP rates:`, rates)
      return {
        rates,
        provider: 'ExchangeRate.host',
        success: true
      }
    }

    throw new ProviderError('Failed to parse COP rates', 'PARSE', 'ExchangeRate.host')

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
        at: new Date().toISOString()
      },
      'COP-USD': {
        base: 'COP',
        quote: 'USD',
        value: 1 / fallbackRate,
        provider: 'Fallback',
        at: new Date().toISOString()
      }
    }

    return {
      rates,
      provider: 'Fallback',
      success: true
    }
  }
}