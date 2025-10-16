'use client'

import { Input } from '@/components/ui/input'
import { formatNumber } from '@/lib/format/currency'
import { useState, useEffect } from 'react'
import { Calculator } from 'lucide-react'

interface AmountInputProps {
  value: number
  onChange: (amount: number) => void
  currency: string
  disabled?: boolean
}

export function AmountInput({ value, onChange, currency, disabled }: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  
  useEffect(() => {
    if (value === 0) {
      setDisplayValue('')
    } else {
      setDisplayValue(value.toString())
    }
  }, [value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow only numbers and one decimal point
    const cleanValue = inputValue.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.')
    const normalizedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleanValue
    
    setDisplayValue(normalizedValue)
    
    // Parse the numeric value
    const numericValue = parseFloat(normalizedValue)
    
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue)
    } else if (normalizedValue === '' || normalizedValue === '.') {
      onChange(0)
    }
  }
  
  return (
    <div className="space-y-3">
      <label htmlFor="amount" className="text-sm font-medium text-foreground">
        Amount
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Calculator className="w-4 h-4" />
        </div>
        <Input
          id="amount"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          disabled={disabled}
          className="pl-10 h-12 text-lg font-medium bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-primary/20 rounded-xl"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
          {currency}
        </div>
      </div>
    </div>
  )
}