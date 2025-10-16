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
}

export function ResultCard({ currency, amount, rate, isLoading }: ResultCardProps) {
  const info = CURRENCY_INFO[currency]
  
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse"></div>
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
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <span className="text-lg">{info.flag}</span>
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{currency}</div>
                <div className="text-xs text-red-600 dark:text-red-400">Rate unavailable</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
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
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:scale-[1.01]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-lg">{info.flag}</span>
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{currency}</div>
              <div className="text-xs text-muted-foreground">{info.name}</div>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            trend === 'up' 
              ? 'bg-green-100 dark:bg-green-900/50' 
              : 'bg-red-100 dark:bg-red-900/50'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {formattedAmount}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="font-medium">{rateText}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-0 shadow-xl">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Source: {rate.provider}</p>
                      {rate.provider.includes('+') && (
                        <p className="text-xs text-slate-300">Cross-conversion</p>
                      )}
                      <p className="text-xs text-slate-300">
                        Updated: {new Date(rate.at).toLocaleString()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className={`text-sm font-medium ${
              trend === 'up' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {trend === 'up' ? '+' : '-'}{trendValue}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}