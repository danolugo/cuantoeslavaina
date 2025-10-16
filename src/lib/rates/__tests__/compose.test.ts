import { describe, it, expect } from 'vitest'
import { convert, roundToSignificantDigits, createRateKey, getInverseRate } from '../compose'
import { Currency, Rate } from '../types'

describe('compose utilities', () => {
  describe('createRateKey', () => {
    it('should create correct rate keys', () => {
      expect(createRateKey('USD', 'VES')).toBe('USD-VES')
      expect(createRateKey('EUR', 'USD')).toBe('EUR-USD')
    })
  })

  describe('getInverseRate', () => {
    it('should create correct inverse rates', () => {
      const rate: Rate = {
        base: 'USD',
        quote: 'VES',
        value: 36.21,
        provider: 'BCV',
        at: '2024-01-01T00:00:00Z'
      }

      const inverse = getInverseRate(rate)
      
      expect(inverse.base).toBe('VES')
      expect(inverse.quote).toBe('USD')
      expect(inverse.value).toBeCloseTo(1 / 36.21, 6)
      expect(inverse.provider).toBe('BCV')
    })
  })

  describe('roundToSignificantDigits', () => {
    it('should round to correct significant digits', () => {
      expect(roundToSignificantDigits(36.2156789, 6)).toBe(36.2157)
      expect(roundToSignificantDigits(0.001234567, 4)).toBe(0.001235)
      expect(roundToSignificantDigits(123456.789, 3)).toBe(123000)
    })
  })

  describe('convert', () => {
    const mockRates = {
      'USD-VES': {
        base: 'USD' as Currency,
        quote: 'VES' as Currency,
        value: 36.21,
        provider: 'BCV',
        at: '2024-01-01T00:00:00Z'
      },
      'EUR-USD': {
        base: 'EUR' as Currency,
        quote: 'USD' as Currency,
        value: 1.08,
        provider: 'Frankfurter',
        at: '2024-01-01T00:00:00Z'
      },
      'VES-USD': {
        base: 'VES' as Currency,
        quote: 'USD' as Currency,
        value: 1 / 36.21,
        provider: 'BCV',
        at: '2024-01-01T00:00:00Z'
      }
    }

    it('should convert same currency to same amount', () => {
      const result = convert(100, 'USD', 'USD', mockRates)
      expect(result).toBe(100)
    })

    it('should convert using direct rate', () => {
      const result = convert(1, 'USD', 'VES', mockRates)
      expect(result).toBeCloseTo(36.21, 2)
    })

    it('should convert using inverse rate', () => {
      const result = convert(36.21, 'VES', 'USD', mockRates)
      expect(result).toBeCloseTo(1, 2)
    })

    it('should convert using cross rate via USD', () => {
      const result = convert(1, 'EUR', 'VES', mockRates)
      expect(result).toBeCloseTo(1.08 * 36.21, 2)
    })

    it('should return null for unavailable conversion', () => {
      const result = convert(1, 'COP', 'VES', mockRates)
      expect(result).toBeNull()
    })
  })
})
