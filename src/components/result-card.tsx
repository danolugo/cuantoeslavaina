'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Currency, CURRENCY_INFO, Rate } from '@/lib/rates/types'
import { formatCurrency, formatRate } from '@/lib/format/currency'
import { Info, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

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
  
  // Simulate trend (this would normally come from historical data)
  const trend = Math.random() > 0.5 ? 'up' : 'down'
  const trendValue = (Math.random() * 2).toFixed(2)
  
  return (
    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg">{info.flag}</span>
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{currency}</div>
              <div className="text-xs text-muted-foreground">{info.name}</div>
            </div>
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
            trend === 'up' 
              ? 'bg-green-500/10' 
              : 'bg-red-500/10'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-2.5">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {formattedAmount}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{rateText}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 cursor-help hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border border-border shadow-lg">
                    <div className="space-y-1.5">
                      <p className="font-medium text-sm">Source: {rate.provider}</p>
                      {rate.provider.includes('+') && (
                        <p className="text-xs text-muted-foreground">Cross-conversion</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(rate.at).toLocaleString()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className={`text-xs font-semibold ${
              trend === 'up' 
                ? 'text-green-600 dark:text-green-500' 
                : 'text-red-600 dark:text-red-500'
            }`}>
              {trend === 'up' ? '+' : '-'}{trendValue}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}