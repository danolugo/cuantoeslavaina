'use client'

import { Currency, CURRENCY_INFO, Rate } from '@/lib/rates/types'
import { formatCurrency, formatRate } from '@/lib/format/currency'
import { Minus } from 'lucide-react'

interface ResultCardProps {
  currency: Currency
  amount: number
  rate: Rate | null
  isLoading?: boolean
  exchangeMode?: 'buy' | 'sell'
}

export function ResultCard({ currency, amount, rate, isLoading, exchangeMode = 'buy' }: ResultCardProps) {
  const info = CURRENCY_INFO[currency]

  if (isLoading) {
    return (
      <div className="glass-card p-4 space-y-3 opacity-70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 animate-pulse rounded w-24"></div>
              <div className="h-3 bg-white/10 animate-pulse rounded w-16"></div>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-5 bg-white/10 animate-pulse rounded w-20 ml-auto"></div>
            <div className="h-3 bg-white/10 animate-pulse rounded w-10 ml-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!rate) {
    return (
      <div className="glass-card p-4 border-destructive/30 bg-destructive/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center border border-destructive/30">
              <span className="text-xl">{info.flag}</span>
            </div>
            <div>
              <div className="font-semibold text-white text-base">{currency}</div>
              <div className="text-xs text-destructive">Rate unavailable</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <Minus className="w-4 h-4 text-destructive" />
          </div>
        </div>
      </div>
    )
  }

  const formattedAmount = formatCurrency(amount, currency)
  const rateText = `1 ${rate.base} = ${formatRate(rate.value, rate.base, rate.quote)} ${rate.quote}`

  const titleDisplay = rate.rateType
    ? `${rate.base} to ${currency} (${rate.rateType === 'official' ? 'BCV' : 'Paralelo'})`
    : `${rate.base} to ${currency}`

  return (
    <div className="group relative bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md border border-white/5 hover:border-white/10 transition-all duration-300 rounded-2xl overflow-hidden mb-3">
      <div className="absolute inset-0 bg-gradient-to-r from-neo-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="p-4 flex items-center justify-between gap-3 relative z-10">

        {/* Left Side: Icon & Titles */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[#0a1224] flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0 group-hover:border-neo-blue/50 transition-colors">
            <span className="text-xl leading-none" aria-hidden>
              {info.flag}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-white text-[15px] tracking-wide">
                {titleDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="font-medium tracking-wide">{rateText}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Values */}
        <div className="text-right flex-shrink-0 pl-2">
          <div className="text-[1.15rem] font-bold text-white tracking-tight">
            {formattedAmount}
          </div>
          <div className="text-[11px] font-medium text-white/40 mt-0.5 tracking-wider uppercase">
            {currency === 'USD' ? 'Dólares' : currency === 'COP' ? 'Pesos' : info.name}
          </div>
        </div>
      </div>
    </div>
  )
}
