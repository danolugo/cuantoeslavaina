'use client'

import { Input } from '@/components/ui/input'
import { formatNumber } from '@/lib/format/currency'
import { useState, useEffect } from 'react'

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
      setDisplayValue(formatNumber(value, 'es-VE', 2))
    }
  }, [value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Remove all non-numeric characters except decimal point
    const cleanValue = inputValue.replace(/[^\d.,]/g, '')
    
    // Replace comma with dot for decimal separator
    const normalizedValue = cleanValue.replace(',', '.')
    
    setDisplayValue(cleanValue)
    
    // Parse the numeric value
    const numericValue = parseFloat(normalizedValue)
    
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue)
    } else if (normalizedValue === '' || normalizedValue === '.') {
      onChange(0)
    }
  }
  
  return (
    <div className="space-y-2">
      <label htmlFor="amount" className="text-sm font-medium">
        Cantidad
      </label>
      <Input
        id="amount"
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="0.00"
        disabled={disabled}
        className="text-lg"
      />
    </div>
  )
}
