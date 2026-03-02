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
    <div className="grid grid-cols-4 gap-2">
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
              'flex flex-col items-center justify-center gap-1 h-14 rounded-2xl border transition-all duration-300 backdrop-blur-md',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-neo-blue focus-visible:ring-offset-2',
              selected
                ? 'bg-neo-blue/20 border-neo-blue text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
            )}
          >
            <span className="text-lg leading-none" aria-hidden>
              {info.flag}
            </span>
            <span className={cn("text-xs font-semibold tracking-wide", selected ? "neon-text" : "")}>{code}</span>
          </button>
        )
      })}
    </div>
  )
}
