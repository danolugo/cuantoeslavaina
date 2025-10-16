export type Currency = 'VES' | 'USD' | 'EUR' | 'COP'

export interface Rate {
  base: Currency
  quote: Currency
  value: number
  provider: string
  at: string
}

export type RatesBundle = Record<string, Rate>

export interface RatesResponse {
  at: string
  providerNotes: string[]
  rates: RatesBundle
}

export interface ProviderResult {
  rates: Partial<RatesBundle>
  provider: string
  success: boolean
  error?: string
}

export const CURRENCY_INFO: Record<Currency, { name: string; symbol: string; flag: string }> = {
  VES: { name: 'Bolívar Soberano', symbol: 'Bs', flag: '🇻🇪' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  COP: { name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
}

export const CURRENCY_PRECISION: Record<Currency, number> = {
  VES: 2,
  USD: 2,
  EUR: 2,
  COP: 2,
}
