'use client'

import { Currency, CURRENCY_INFO } from '@/lib/rates/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CurrencySelectProps {
  value: Currency
  onChange: (currency: Currency) => void
  disabled?: boolean
}

export function CurrencySelect({ value, onChange, disabled }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCY_INFO).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{info.flag}</span>
              <span className="font-medium">{code}</span>
              <span className="text-muted-foreground text-sm">{info.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
