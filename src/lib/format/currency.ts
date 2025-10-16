import { Currency, CURRENCY_PRECISION } from '@/lib/rates/types'

export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = 'es-VE'
): string {
  const precision = CURRENCY_PRECISION[currency]
  const rounded = Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision)
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'VES' ? 'VES' : currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(rounded)
}

export function formatNumber(
  amount: number,
  locale: string = 'es-VE',
  precision: number = 2
): string {
  const rounded = Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision)
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(rounded)
}

export function formatRate(
  rate: number,
  from: Currency,
  to: Currency,
  locale: string = 'es-VE'
): string {
  const precision = Math.max(CURRENCY_PRECISION[from], CURRENCY_PRECISION[to])
  const rounded = Math.round(rate * Math.pow(10, precision)) / Math.pow(10, precision)
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(rounded)
}
