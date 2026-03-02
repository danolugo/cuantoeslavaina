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
      setDisplayValue(value.toString().replace('.', ','))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Treat comma as decimal point
    const inputValue = e.target.value.replace('.', ',')

    // Allow only numbers and one comma
    const cleanValue = inputValue.replace(/[^\d,]/g, '')

    // Ensure only one comma
    const parts = cleanValue.split(',')
    const normalizedValue = parts.length > 2
      ? parts[0] + ',' + parts.slice(1).join('')
      : cleanValue

    setDisplayValue(normalizedValue)

    // Parse the numeric value internally as float (with dot)
    const numericValue = parseFloat(normalizedValue.replace(',', '.'))

    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue)
    } else if (normalizedValue === '' || normalizedValue === ',') {
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
        placeholder="0.00"
        disabled={disabled}
        className="h-auto py-1 text-white font-bold bg-transparent border-0 shadow-none focus-visible:ring-0 rounded-none text-[3.5rem] md:text-[4rem] leading-none tracking-tight px-0 placeholder:text-white/20"
        aria-label="Cantidad a convertir"
      />
    )
  }

  return (
    <div className="space-y-2">
      <label htmlFor="amount" className="text-sm font-medium text-muted-foreground">
        Cantidad
      </label>
      <div className="relative border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md focus-within:ring-2 focus-within:ring-neo-blue focus-within:border-neo-blue transition-all">
        <Input
          id="amount"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0.00"
          disabled={disabled}
          className="h-14 text-lg font-semibold bg-transparent border-0 shadow-none focus-visible:ring-0 px-4 pr-16 text-white placeholder:text-white/30"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-bold text-white/50">
          {currency}
        </div>
      </div>
    </div>
  )
}
