import { describe, it, expect } from 'vitest'
import { formatCurrency, formatNumber, formatRate } from '../currency'
import { Currency } from '../../rates/types'

describe('currency formatting', () => {
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      const result = formatCurrency(1234.56, 'USD')
      expect(result).toContain('1,234.56')
    })

    it('should format VES correctly', () => {
      const result = formatCurrency(1234.56, 'VES')
      expect(result).toContain('1,234.56')
    })

    it('should format EUR correctly', () => {
      const result = formatCurrency(1234.56, 'EUR')
      expect(result).toContain('1,234.56')
    })

    it('should format COP correctly', () => {
      const result = formatCurrency(1234.56, 'COP')
      expect(result).toContain('1,234.56')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with correct precision', () => {
      expect(formatNumber(1234.567, 'es-VE', 2)).toBe('1,234.57')
      expect(formatNumber(1234.567, 'es-VE', 3)).toBe('1,234.567')
    })

    it('should handle zero correctly', () => {
      expect(formatNumber(0, 'es-VE', 2)).toBe('0.00')
    })
  })

  describe('formatRate', () => {
    it('should format rates with correct precision', () => {
      const result = formatRate(36.2156789, 'USD', 'VES')
      expect(result).toBe('36.22')
    })

    it('should handle small rates correctly', () => {
      const result = formatRate(0.0276, 'VES', 'USD')
      expect(result).toBe('0.03')
    })
  })
})
