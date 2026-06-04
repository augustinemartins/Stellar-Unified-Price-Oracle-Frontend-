import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceShort, timeAgo, formatTimestamp, formatChartTime, formatChartPrice } from './format'

describe('formatPrice', () => {
  it('formats prices >= 1000 with 2 fraction digits', () => {
    expect(formatPrice(1234.56)).toBe('1,234.56')
    expect(formatPrice(1000)).toBe('1,000.00')
  })

  it('formats prices >= 1 with 4 fraction digits', () => {
    expect(formatPrice(1.2345)).toBe('1.2345')
    expect(formatPrice(999.9999)).toBe('999.9999')
  })

  it('formats prices < 1 with 6-8 fraction digits', () => {
    expect(formatPrice(0.123456)).toBe('0.123456')
    expect(formatPrice(0.00000123)).toBe('0.00000123')
  })
})

describe('timeAgo', () => {
  it('returns seconds ago', () => {
    expect(timeAgo(Date.now() - 30000)).toBe('30s ago')
  })

  it('returns minutes ago', () => {
    expect(timeAgo(Date.now() - 120000)).toBe('2m ago')
  })

  it('returns hours ago', () => {
    expect(timeAgo(Date.now() - 7200000)).toBe('2h ago')
  })
})

describe('formatTimestamp', () => {
  it('formats a timestamp', () => {
    const ts = new Date('2026-06-04T12:00:00Z').getTime()
    const result = formatTimestamp(ts)
    expect(result).toContain('Jun')
    expect(result).toContain('4')
  })
})

describe('formatChartTime', () => {
  it('formats time for chart axis', () => {
    const ts = new Date('2026-06-04T14:30:00Z').getTime()
    const result = formatChartTime(ts)
    expect(result).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/)
  })
})

describe('formatPriceShort', () => {
  it('formats without max fraction digits', () => {
    expect(formatPriceShort(1234.5)).toBe('1,234.50')
    expect(formatPriceShort(1.2345)).toBe('1.2345')
    expect(formatPriceShort(0.123456)).toBe('0.123456')
  })
})

describe('formatChartPrice', () => {
  it('formats chart prices without max fraction digits', () => {
    expect(formatChartPrice(1234.5)).toBe('1,234.50')
    expect(formatChartPrice(0.123456)).toBe('0.123456')
  })
})
