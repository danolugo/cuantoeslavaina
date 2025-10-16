'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Currency, CURRENCY_INFO, Rate } from '@/lib/rates/types'
import { formatCurrency, formatRate } from '@/lib/format/currency'
import { Info } from 'lucide-react'

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
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info.flag}</span>
            <span className="font-medium">{currency}</span>
          </div>
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </div>
      </Card>
    )
  }
  
  if (!rate) {
    return (
      <Card className="p-4 border-destructive/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{info.flag}</span>
            <span className="font-medium">{currency}</span>
          </div>
          <div className="text-destructive text-sm">
            Tasa no disponible
          </div>
        </div>
      </Card>
    )
  }
  
  const formattedAmount = formatCurrency(amount, currency)
  const rateText = `1 ${rate.base} = ${formatRate(rate.value, rate.base, rate.quote)} ${rate.quote}`
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info.flag}</span>
          <span className="font-medium">{currency}</span>
        </div>
        
        <div className="text-2xl font-bold">
          {formattedAmount}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{rateText}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Fuente: {rate.provider}</p>
                {rate.provider.includes('+') && (
                  <p className="text-xs mt-1">Conversión cruzada</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  )
}
