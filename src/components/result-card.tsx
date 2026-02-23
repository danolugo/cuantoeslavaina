'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Currency, CURRENCY_INFO, Rate } from '@/lib/rates/types'
import { formatCurrency, formatRate } from '@/lib/format/currency'
import { Info, Minus } from 'lucide-react'

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
      <Card className="border border-border bg-card shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-12"></div>
              </div>
            </div>
            <div className="w-6 h-6 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    )
  }
  
  if (!rate) {
    return (
      <Card className="border border-destructive/30 bg-destructive/5 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <span className="text-lg">{info.flag}</span>
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{currency}</div>
                <div className="text-xs text-destructive">Rate unavailable</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <Minus className="w-4 h-4 text-destructive" />
            </div>
          </div>
        </div>
      </Card>
    )
  }
  
  const formattedAmount = formatCurrency(amount, currency)
  
  // Show the rate in the correct format: "1 USD = 201 VES" (not "1 VES = 0.000 USD")
  const rateText = `1 ${rate.base} = ${formatRate(rate.value, rate.base, rate.quote)} ${rate.quote}`
  
  return (
    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg leading-none" aria-hidden>
              {info.flag}
            </span>
            <span className="font-semibold text-foreground text-sm">
              {currency === 'USD' ? 'Dólares' : currency === 'COP' ? 'Pesos' : info.name}
            </span>
          </div>
          <div className="text-[clamp(1.25rem,5vw,1.75rem)] font-bold text-foreground tracking-tight">
            {formattedAmount}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="font-medium">{rateText}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 cursor-help hover:text-foreground transition-colors flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="bg-card border border-border shadow-lg">
                  <div className="space-y-1.5">
                    <p className="font-medium text-sm">Fuente: {rate.provider}</p>
                    {rate.provider.includes('+') && (
                      <p className="text-xs text-muted-foreground">Conversión cruzada</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Actualizado: {new Date(rate.at).toLocaleString()}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
          {currency}
        </span>
      </div>
    </Card>
  )
}