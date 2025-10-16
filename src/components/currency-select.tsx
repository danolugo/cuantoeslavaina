'use client'

import { Currency, CURRENCY_INFO } from '@/lib/rates/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

interface CurrencySelectProps {
  value: Currency
  onChange: (currency: Currency) => void
  disabled?: boolean
}

export function CurrencySelect({ value, onChange, disabled }: CurrencySelectProps) {
  const selectedInfo = CURRENCY_INFO[value]
  
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-primary/20 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{selectedInfo.flag}</span>
            <span className="font-medium text-sm">{value}</span>
            <span className="text-xs text-muted-foreground">{selectedInfo.name}</span>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
        {Object.entries(CURRENCY_INFO).map(([code, info]) => (
          <SelectItem key={code} value={code} className="hover:bg-primary/5 focus:bg-primary/5 rounded-lg">
            <div className="flex items-center space-x-3 py-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-lg">{info.flag}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{code}</span>
                <span className="text-xs text-muted-foreground">{info.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}