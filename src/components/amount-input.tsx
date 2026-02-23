'use client'

import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

interface AmountInputProps {
  value: number
  onChange: (amount: number) => void
  currency: string
  disabled?: boolean
  /** Large display-style input for main amount card */
  variant?: 'default' | 'display'
}

export function AmountInput({ value, onChange, currency, disabled, variant = 'default' }: AmountInputProps) {
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
  
  if (variant === 'display') {
    return (
      <Input
        id="amount"
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="0"
        disabled={disabled}
        className="h-auto min-h-[2.5rem] py-1 text-foreground font-bold bg-transparent border-0 shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg text-[clamp(1.75rem,8vw,2.75rem)] leading-none tracking-tight"
        aria-label="Cantidad a convertir"
      />
    )
  }

  return (
    <div className="space-y-2">
      <label htmlFor="amount" className="text-sm font-medium text-foreground">
        Cantidad
      </label>
      <div className="relative">
        <Input
          id="amount"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          disabled={disabled}
          className="h-12 text-lg font-semibold bg-card border border-border shadow-sm focus:shadow-md transition-shadow focus:ring-2 focus:ring-primary/20 rounded-xl pr-16"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-muted-foreground">
          {currency}
        </div>
      </div>
    </div>
  )
}