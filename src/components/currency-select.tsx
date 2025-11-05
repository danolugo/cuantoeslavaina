'use client'

import { Currency, CURRENCY_INFO } from '@/lib/rates/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CurrencySelectProps {
  value: Currency
  onChange: (currency: Currency) => void
  disabled?: boolean
}

export function CurrencySelect({ value, onChange, disabled }: CurrencySelectProps) {
  const selectedInfo = CURRENCY_INFO[value]
  
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-12 bg-card border border-border shadow-sm focus:shadow-md transition-shadow focus:ring-2 focus:ring-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{selectedInfo.flag}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{value}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">{selectedInfo.name}</span>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-card border border-border shadow-lg rounded-lg">
        {Object.entries(CURRENCY_INFO).map(([code, info]) => (
          <SelectItem key={code} value={code} className="hover:bg-muted focus:bg-muted rounded-md">
            <div className="flex items-center gap-3 py-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg">{info.flag}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{code}</span>
                <span className="text-xs text-muted-foreground">{info.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}