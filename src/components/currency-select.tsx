'use client'

import { Currency, CURRENCY_INFO } from '@/lib/rates/types'
import { cn } from '@/lib/utils'

interface CurrencySelectProps {
  value: Currency
  onChange: (currency: Currency) => void
  disabled?: boolean
}

const CURRENCIES: Currency[] = ['VES', 'USD', 'EUR', 'COP']

export function CurrencySelect({ value, onChange, disabled }: CurrencySelectProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {CURRENCIES.map((code) => {
        const info = CURRENCY_INFO[code]
        const selected = value === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 min-h-[3.25rem] py-3 px-3 rounded-xl border-2 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              selected
                ? 'bg-primary/15 border-primary text-primary font-semibold'
                : 'bg-card border-border text-foreground hover:border-primary/40 hover:bg-muted/50'
            )}
          >
            <span className="text-xl leading-none" aria-hidden>
              {info.flag}
            </span>
            <span className="text-sm font-semibold">{code}</span>
          </button>
        )
      })}
    </div>
  )
}
