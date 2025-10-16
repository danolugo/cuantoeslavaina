import { Currency, Rate, RatesBundle } from './types'
import { getBCVRates } from './providers/bcv'
import { getFrankfurterRates } from './providers/frankfurter'
import { getPublicFxRates } from './providers/publicFx'
import { getAlternativeVESRates } from './providers/alternativeVes'
import { getColombianPesoRates } from './providers/colombianPeso'

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
  const [bcvResult, frankfurterResult, publicFxResult, alternativeVesResult, colombianPesoResult] = await Promise.allSettled([
    getBCVRates(),
    getFrankfurterRates(),
    getPublicFxRates(),
    getAlternativeVESRates(),
    getColombianPesoRates()
  ])
  
  // Process BCV results
  if (bcvResult.status === 'fulfilled' && bcvResult.value.success) {
    Object.assign(allRates, bcvResult.value.rates)
    providerNotes.push(`BCV: ${Object.keys(bcvResult.value.rates).length} rates`)
  } else {
    const error = bcvResult.status === 'rejected' ? bcvResult.reason?.message : bcvResult.value?.error
    providerNotes.push(`BCV: Failed (${error})`)
  }
  
  // Process Frankfurter results
  if (frankfurterResult.status === 'fulfilled' && frankfurterResult.value.success) {
    Object.assign(allRates, frankfurterResult.value.rates)
    providerNotes.push(`Frankfurter: ${Object.keys(frankfurterResult.value.rates).length} rates`)
  } else {
    const error = frankfurterResult.status === 'rejected' ? frankfurterResult.reason?.message : frankfurterResult.value?.error
    providerNotes.push(`Frankfurter: Failed (${error})`)
  }
  
  // Process Public FX results
  if (publicFxResult.status === 'fulfilled' && publicFxResult.value.success) {
    Object.assign(allRates, publicFxResult.value.rates)
    providerNotes.push(`PublicFX: ${Object.keys(publicFxResult.value.rates).length} rates`)
  } else {
    const error = publicFxResult.status === 'rejected' ? publicFxResult.reason?.message : publicFxResult.value?.error
    providerNotes.push(`PublicFX: Failed (${error})`)
  }
  
  // Process Alternative VES results
  if (alternativeVesResult.status === 'fulfilled' && alternativeVesResult.value.success) {
    Object.assign(allRates, alternativeVesResult.value.rates)
    providerNotes.push(`Alternative-VES: ${Object.keys(alternativeVesResult.value.rates).length} rates`)
  } else {
    const error = alternativeVesResult.status === 'rejected' ? alternativeVesResult.reason?.message : alternativeVesResult.value?.error
    providerNotes.push(`Alternative-VES: Failed (${error})`)
  }
  
  // Process Colombian Peso results
  if (colombianPesoResult.status === 'fulfilled' && colombianPesoResult.value.success) {
    Object.assign(allRates, colombianPesoResult.value.rates)
    providerNotes.push(`Colombian-Peso: ${Object.keys(colombianPesoResult.value.rates).length} rates`)
  } else {
    const error = colombianPesoResult.status === 'rejected' ? colombianPesoResult.reason?.message : colombianPesoResult.value?.error
    providerNotes.push(`Colombian-Peso: Failed (${error})`)
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
    providerNotes.push(`Adding fallback rates for: ${missingEssential.join(', ')}`)
  }
  
  // Add fallback rates if we have very few rates
  if (Object.keys(allRates).length < 4) {
    providerNotes.push('Using fallback rates due to limited data')
    
    // Add some reasonable fallback rates for testing
    if (!allRates['USD-VES']) {
      allRates['USD-VES'] = {
        base: 'USD',
        quote: 'VES',
        value: 195.0, // Updated approximate rate (October 2024)
        provider: 'Fallback',
        at: new Date().toISOString()
      }
      allRates['VES-USD'] = getInverseRate(allRates['USD-VES'])
    }
    
    if (!allRates['USD-COP']) {
      allRates['USD-COP'] = {
        base: 'USD',
        quote: 'COP',
        value: 4200.0, // Updated approximate rate (October 2024)
        provider: 'Fallback',
        at: new Date().toISOString()
      }
      allRates['COP-USD'] = getInverseRate(allRates['USD-COP'])
    }
    
    if (!allRates['EUR-USD']) {
      allRates['EUR-USD'] = {
        base: 'EUR',
        quote: 'USD',
        value: 1.08, // Approximate rate (October 2024)
        provider: 'Fallback',
        at: new Date().toISOString()
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
            providerNotes.push('COP-VES: Computed via COP-USD × USD-VES')
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
        providerNotes.push('EUR-VES: Computed via EUR-USD × USD-VES')
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
        providerNotes.push('EUR-COP: Computed via EUR-USD × USD-COP')
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
  
  // Try cross conversion via USD (most reliable base currency)
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
  
  // Try cross conversion via COP (for VES-COP specifically)
  if (from === 'VES' && to === 'COP') {
    const vesUsdKey = createRateKey('VES', 'USD')
    const usdCopKey = createRateKey('USD', 'COP')
    
    if (rates[vesUsdKey] && rates[usdCopKey]) {
      const viaUsd = amount * rates[vesUsdKey].value * rates[usdCopKey].value
      return roundToSignificantDigits(viaUsd, 8)
    }
  }
  
  if (from === 'COP' && to === 'VES') {
    const copUsdKey = createRateKey('COP', 'USD')
    const usdVesKey = createRateKey('USD', 'VES')
    
    if (rates[copUsdKey] && rates[usdVesKey]) {
      const viaUsd = amount * rates[copUsdKey].value * rates[usdVesKey].value
      return roundToSignificantDigits(viaUsd, 8)
    }
  }
  
  // Try multi-hop conversion: VES -> USD -> EUR -> Target
  if (from === 'VES' && (to === 'EUR' || to === 'COP')) {
    const vesUsdKey = createRateKey('VES', 'USD')
    const usdEurKey = createRateKey('USD', 'EUR')
    const eurTargetKey = createRateKey('EUR', to)
    
    if (rates[vesUsdKey] && rates[usdEurKey] && rates[eurTargetKey]) {
      const viaUsdEur = amount * rates[vesUsdKey].value * rates[usdEurKey].value * rates[eurTargetKey].value
      return roundToSignificantDigits(viaUsdEur, 8)
    }
  }
  
  return null
}
