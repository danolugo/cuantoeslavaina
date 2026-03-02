import { Rate, ProviderResult } from '../types'

export async function getAlternativeVESRates(requestId: string): Promise<ProviderResult> {
  const providerName = 'Binance P2P'
  const allRates: Rate[] = []

  try {
    const url = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search'

    // We send a POST request to find the top 10 merchants selling USDT for VES
    const body = {
      asset: 'USDT',
      fiat: 'VES',
      merchantCheck: false,
      page: 1,
      rows: 10,
      payTypes: [],
      publisherType: null,
      tradeType: 'BUY' // BUY means we are buying USDT, they are selling
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify(body),
      signal: controller.signal as RequestInit['signal']
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from Binance P2P`)
    }

    const data = await response.json()

    if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No P2P offers found from Binance')
    }

    // Extract prices from top 10 offers
    const prices = data.data.map((item: any) => parseFloat(item.adv.price))

    // Validate prices
    const validPrices = prices.filter((p: number) => !isNaN(p) && p > 50 && p < 2000)

    if (validPrices.length === 0) {
      throw new Error('No valid price ranges found in Binance P2P data')
    }

    // Calculate Average
    const sum = validPrices.reduce((a: number, b: number) => a + b, 0)
    const avgPrice = sum / validPrices.length

    allRates.push({
      base: 'USD',
      quote: 'VES',
      value: avgPrice,
      provider: `${providerName} (Avg of ${validPrices.length})`,
      at: new Date().toISOString(),
      rateType: 'market'
    })

    return {
      rates: {
        'USD-VES_MARKET': allRates[0]
      },
      provider: providerName,
      success: true
    }

  } catch (error) {
    console.warn(`[${requestId}] ${providerName} failed:`, error)
    return {
      rates: {},
      provider: providerName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

