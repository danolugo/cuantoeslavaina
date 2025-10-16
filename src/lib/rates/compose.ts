import { Currency, Rate, RatesBundle } from './types'
import { getBCVRates } from './providers/bcv'
import { getFrankfurterRates } from './providers/frankfurter'
import { getPublicFxRates } from './providers/publicFx'

export function createRateKey(base: Currency, quote: Currency): string {
  return `${base}-${quote}`
}

export function getInverseRate(rate: Rate): Rate {
  return {
    base: rate.quote,
    quote: rate.base,
    value: 1 / rate.value,
    provider: rate.provider,
    at: rate.at
  }
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
  
  return {
    base: targetBase,
    quote: targetQuote,
    value: roundedValue,
    provider: `${rate1.provider}+${rate2.provider}`,
    at: new Date().toISOString()
  }
}

export async function composeRates(): Promise<RatesBundle> {
  const allRates: RatesBundle = {}
  const providerNotes: string[] = []
  
  // Fetch from all providers in parallel
  const [bcvResult, frankfurterResult, publicFxResult] = await Promise.allSettled([
    getBCVRates(),
    getFrankfurterRates(),
    getPublicFxRates()
  ])
  
  // Process BCV results
  if (bcvResult.status === 'fulfilled' && bcvResult.value.success) {
    Object.assign(allRates, bcvResult.value.rates)
    providerNotes.push(`BCV: ${Object.keys(bcvResult.value.rates).length} rates`)
  } else {
    providerNotes.push('BCV: Unavailable')
  }
  
  // Process Frankfurter results
  if (frankfurterResult.status === 'fulfilled' && frankfurterResult.value.success) {
    Object.assign(allRates, frankfurterResult.value.rates)
    providerNotes.push(`Frankfurter: ${Object.keys(frankfurterResult.value.rates).length} rates`)
  } else {
    providerNotes.push('Frankfurter: Unavailable')
  }
  
  // Process Public FX results
  if (publicFxResult.status === 'fulfilled' && publicFxResult.value.success) {
    Object.assign(allRates, publicFxResult.value.rates)
    providerNotes.push(`PublicFX: ${Object.keys(publicFxResult.value.rates).length} rates`)
  } else {
    providerNotes.push('PublicFX: Unavailable')
  }
  
  // Add inverse rates for all direct rates
  const directRates = { ...allRates }
  for (const [key, rate] of Object.entries(directRates)) {
    const inverseKey = createRateKey(rate.quote, rate.base)
    if (!allRates[inverseKey]) {
      allRates[inverseKey] = getInverseRate(rate)
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
            providerNotes.push('COP-VES: Computed via COP-USD × USD-VES')
          }
        }
      }
    }
  }
  
  return allRates
}

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: RatesBundle
): number | null {
  if (from === to) return amount
  
  const directKey = createRateKey(from, to)
  const directRate = rates[directKey]
  
  if (directRate) {
    return roundToSignificantDigits(amount * directRate.value, 8)
  }
  
  // Try cross conversion via USD
  const fromUsdKey = createRateKey(from, 'USD')
  const usdToKey = createRateKey('USD', to)
  
  if (rates[fromUsdKey] && rates[usdToKey]) {
    const viaUsd = amount * rates[fromUsdKey].value * rates[usdToKey].value
    return roundToSignificantDigits(viaUsd, 8)
  }
  
  // Try cross conversion via EUR
  const fromEurKey = createRateKey(from, 'EUR')
  const eurToKey = createRateKey('EUR', to)
  
  if (rates[fromEurKey] && rates[eurToKey]) {
    const viaEur = amount * rates[fromEurKey].value * rates[eurToKey].value
    return roundToSignificantDigits(viaEur, 8)
  }
  
  return null
}
