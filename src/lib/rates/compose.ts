import { Currency, Rate, RatesBundle, ProviderResult, RateProviderError } from './types'
import { getBCVRates } from './providers/bcv'
import { getFrankfurterRates } from './providers/frankfurter'
import { getPublicFxRates } from './providers/publicFx'
import { getAlternativeVESRates } from './providers/alternativeVes'
import { getColombianPesoRates } from './providers/colombianPeso'
import { cache, TTL_2_HOURS, TTL_12_HOURS, TTL_5_MINS } from '../cache'

export function createRateKey(base: Currency, quote: Currency): string {
  return `${base}-${quote}`
}

export function getInverseRate(rate: Rate): Rate {
  const inverseRate: Rate = {
    base: rate.quote,
    quote: rate.base,
    value: 1 / rate.value,
    provider: rate.provider,
    at: rate.at
  }

  if (rate.stale) inverseRate.stale = true
  if (rate.confidence) inverseRate.confidence = rate.confidence

  return inverseRate
}

export function roundToSignificantDigits(value: number, digits: number = 6): number {
  if (value === 0) return 0
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const factor = Math.pow(10, digits - 1 - magnitude)
  return Math.round(value * factor) / factor
}

export function computeCrossRate(
  rate1: Rate,
  rate2: Rate,
  targetBase: Currency,
  targetQuote: Currency
): Rate | null {
  // Check if we can compute the cross rate
  if (rate1.quote !== rate2.base) {
    return null
  }

  const crossValue = rate1.value * rate2.value
  const roundedValue = roundToSignificantDigits(crossValue)

  const rate: Rate = {
    base: targetBase,
    quote: targetQuote,
    value: roundedValue,
    provider: `${rate1.provider}+${rate2.provider}`,
    at: new Date().toISOString()
  }

  if (rate1.stale || rate2.stale) rate.stale = true
  if (rate1.confidence === 'low' || rate2.confidence === 'low') rate.confidence = 'low'

  return rate
}

export async function composeRates(forceRefresh: boolean = false, requestId: string): Promise<{ rates: RatesBundle; errors: RateProviderError[] }> {
  const allRates: RatesBundle = {}
  const errors: RateProviderError[] = []

  let needsVes = true
  let needsEur = true
  let needsCop = true

  const ALL_PAIRS = [
    'USD-VES', 'VES-USD', 'EUR-USD', 'USD-EUR', 'USD-COP', 'COP-USD',
    'EUR-VES', 'VES-EUR', 'EUR-COP', 'COP-EUR', 'COP-VES', 'VES-COP'
  ]

  if (!forceRefresh) {
    const cachedUsdVes = await cache.get<Rate>('USD-VES')
    const cachedEurUsd = await cache.get<Rate>('EUR-USD')
    const cachedUsdCop = await cache.get<Rate>('USD-COP')

    needsVes = !cachedUsdVes
    needsEur = !cachedEurUsd
    needsCop = !cachedUsdCop

    for (const pair of ALL_PAIRS) {
      const cached = await cache.get<Rate>(pair)
      if (cached) {
        allRates[pair] = cached
      }
    }

    if (!needsVes && !needsEur && !needsCop) {
      // Loaded core pairs entirely from cache
    }
  }

  // Fetch missing providers in parallel
  const [bcvResult, frankfurterResult, publicFxResult, alternativeVesResult, colombianPesoResult] = await Promise.allSettled([
    needsVes ? getBCVRates(requestId) : Promise.resolve({ success: true, rates: {}, provider: 'Cached' } as ProviderResult),
    needsEur ? getFrankfurterRates(requestId) : Promise.resolve({ success: true, rates: {}, provider: 'Cached' } as ProviderResult),
    needsCop || needsEur ? getPublicFxRates(requestId) : Promise.resolve({ success: true, rates: {}, provider: 'Cached' } as ProviderResult),
    needsVes ? getAlternativeVESRates(requestId) : Promise.resolve({ success: true, rates: {}, provider: 'Cached' } as ProviderResult),
    needsCop ? getColombianPesoRates(requestId) : Promise.resolve({ success: true, rates: {}, provider: 'Cached' } as ProviderResult)
  ])

  // Process BCV results
  if (bcvResult.status === 'fulfilled' && bcvResult.value.success) {
    Object.assign(allRates, bcvResult.value.rates)
  } else {
    errors.push({ provider: 'BCV', message: 'Failed to fetch rates' })
  }

  // Process Frankfurter results
  if (frankfurterResult.status === 'fulfilled' && frankfurterResult.value.success) {
    Object.assign(allRates, frankfurterResult.value.rates)
  } else {
    errors.push({ provider: 'Frankfurter', message: 'Failed to fetch rates' })
  }

  // Process Public FX results
  if (publicFxResult.status === 'fulfilled' && publicFxResult.value.success) {
    Object.assign(allRates, publicFxResult.value.rates)
  } else {
    errors.push({ provider: 'PublicFX', message: 'Failed to fetch rates' })
  }

  // Process Alternative VES results
  if (alternativeVesResult.status === 'fulfilled' && alternativeVesResult.value.success) {
    Object.assign(allRates, alternativeVesResult.value.rates)
  } else {
    errors.push({ provider: 'Alternative-VES', message: 'Failed to fetch rates' })
  }

  // Process Colombian Peso results
  if (colombianPesoResult.status === 'fulfilled' && colombianPesoResult.value.success) {
    Object.assign(allRates, colombianPesoResult.value.rates)
  } else {
    errors.push({ provider: 'Colombian-Peso', message: 'Failed to fetch rates' })
  }

  // Add inverse rates for all direct rates
  const directRates = { ...allRates }
  for (const [key, rate] of Object.entries(directRates)) {
    const inverseKey = createRateKey(rate.quote, rate.base)
    if (!allRates[inverseKey]) {
      allRates[inverseKey] = getInverseRate(rate)
    }
  }

  // Ensure we always have essential rates
  const essentialRates = ['USD-VES', 'USD-COP', 'EUR-USD']
  const missingEssential = essentialRates.filter(rate => !allRates[rate])

  if (missingEssential.length > 0) {
    // Adding fallback rates
  }

  // Add fallback rates if we have very few rates
  if (Object.keys(allRates).length < 4) {

    // Add some reasonable fallback rates for testing
    if (!allRates['USD-VES']) {
      allRates['USD-VES'] = {
        base: 'USD',
        quote: 'VES',
        value: 195.0, // Updated approximate rate (October 2024)
        provider: 'Fallback',
        at: new Date().toISOString(),
        confidence: 'low',
        stale: true
      }
      allRates['VES-USD'] = getInverseRate(allRates['USD-VES'])
    }

    if (!allRates['USD-COP']) {
      allRates['USD-COP'] = {
        base: 'USD',
        quote: 'COP',
        value: 4200.0, // Updated approximate rate (October 2024)
        provider: 'Fallback',
        at: new Date().toISOString(),
        confidence: 'low',
        stale: true
      }
      allRates['COP-USD'] = getInverseRate(allRates['USD-COP'])
    }

    if (!allRates['EUR-USD']) {
      allRates['EUR-USD'] = {
        base: 'EUR',
        quote: 'USD',
        value: 1.08, // Approximate rate (October 2024)
        provider: 'Fallback',
        at: new Date().toISOString(),
        confidence: 'low',
        stale: true
      }
      allRates['USD-EUR'] = getInverseRate(allRates['EUR-USD'])
    }
  }

  // Compute cross rates for missing pairs
  const requiredPairs = [
    'COP-VES', 'VES-COP'
  ]

  for (const pair of requiredPairs) {
    if (!allRates[pair]) {
      const [base, quote] = pair.split('-') as [Currency, Currency]

      // Try COP-VES via COP-USD and USD-VES
      if (base === 'COP' && quote === 'VES') {
        const copUsd = allRates['COP-USD']
        const usdVes = allRates['USD-VES']

        if (copUsd && usdVes) {
          const crossRate = computeCrossRate(copUsd, usdVes, 'COP', 'VES')
          if (crossRate) {
            allRates['COP-VES'] = crossRate
            allRates['VES-COP'] = getInverseRate(crossRate)
          }
        }
      }
    }
  }

  // Ensure EUR cross pairs exist for display
  if (!allRates['EUR-VES']) {
    const eurUsd = allRates['EUR-USD']
    const usdVes = allRates['USD-VES']
    if (eurUsd && usdVes) {
      const crossRate = computeCrossRate(eurUsd, usdVes, 'EUR', 'VES')
      if (crossRate) {
        allRates['EUR-VES'] = crossRate
        allRates['VES-EUR'] = getInverseRate(crossRate)
      }
    }
  }

  if (!allRates['EUR-COP']) {
    const eurUsd = allRates['EUR-USD']
    const usdCop = allRates['USD-COP']
    if (eurUsd && usdCop) {
      const crossRate = computeCrossRate(eurUsd, usdCop, 'EUR', 'COP')
      if (crossRate) {
        allRates['EUR-COP'] = crossRate
        allRates['COP-EUR'] = getInverseRate(crossRate)
      }
    }
  }

  // Save ALL evaluated rates to the cache with correct TTL
  for (const [key, rate] of Object.entries(allRates)) {
    const isVes = key.includes('VES')
    let ttl = isVes ? TTL_2_HOURS : TTL_12_HOURS

    // Fallbacks and low confidence rates get very short TTL
    if (rate.confidence === 'low' || rate.provider.includes('Fallback')) {
      ttl = TTL_5_MINS
    }

    await cache.set(key, rate, ttl)
  }

  return { rates: allRates, errors }
}

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: RatesBundle,
  mode: 'buy' | 'sell' = 'buy'
): number | null {
  if (from === to) return amount

  // Apply spread: buy rate is higher (you pay more), sell rate is lower (you get less)
  // Using 1.5% spread (0.015)
  const spread = 0.015
  const spreadMultiplier = mode === 'buy' ? (1 + spread) : (1 - spread)

  const directKey = createRateKey(from, to)
  const directRate = rates[directKey]

  if (directRate) {
    const adjustedRate = directRate.value * spreadMultiplier
    return roundToSignificantDigits(amount * adjustedRate, 8)
  }

  // Try simplified universal cross conversion via USD
  const fromUsdKey = createRateKey(from, 'USD')
  const usdToKey = createRateKey('USD', to)

  // If we have both legs via USD
  if (rates[fromUsdKey] && rates[usdToKey]) {
    const viaUsd = amount * rates[fromUsdKey].value * rates[usdToKey].value
    const adjustedViaUsd = viaUsd * spreadMultiplier
    return roundToSignificantDigits(adjustedViaUsd, 8)
  }

  // If we have EUR conversion via USD logic
  const fromEurKey = createRateKey(from, 'EUR')
  const eurToKey = createRateKey('EUR', to)

  if (rates[fromEurKey] && rates[eurToKey]) {
    const viaEur = amount * rates[fromEurKey].value * rates[eurToKey].value
    const adjustedViaEur = viaEur * spreadMultiplier
    return roundToSignificantDigits(adjustedViaEur, 8)
  }

  // Ultimate Fallback: Force route through USD by constructing missing legs
  // from -> USD -> to
  let rateToUsd = 1
  let rateFromUsd = 1

  if (from !== 'USD') {
    const toUsd = rates[createRateKey(from, 'USD')]
    if (toUsd) rateToUsd = toUsd.value
    else {
      // Try inverted
      const usdFrom = rates[createRateKey('USD', from)]
      if (usdFrom) rateToUsd = 1 / usdFrom.value
      else return null
    }
  }

  if (to !== 'USD') {
    const fromUsd = rates[createRateKey('USD', to)]
    if (fromUsd) rateFromUsd = fromUsd.value
    else {
      // Try inverted
      const toUsd = rates[createRateKey(to, 'USD')]
      if (toUsd) rateFromUsd = 1 / toUsd.value
      else return null
    }
  }

  const universalCross = amount * rateToUsd * rateFromUsd
  const adjustedUniversal = universalCross * spreadMultiplier
  return roundToSignificantDigits(adjustedUniversal, 8)
}
