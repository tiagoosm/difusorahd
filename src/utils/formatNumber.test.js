import { describe, it, expect } from 'vitest'
import { formatNumber, calcGrowth } from './formatNumber'

describe('formatNumber', () => {
  it('formats using pt-BR thousands separator', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })

  it('treats null/undefined as zero', () => {
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
  })
})

describe('calcGrowth', () => {
  it('calculates percentage change between two periods', () => {
    expect(calcGrowth(150, 100)).toBe(50)
    expect(calcGrowth(50, 100)).toBe(-50)
  })

  it('returns undefined when there is no baseline but there is current activity ("Novo")', () => {
    expect(calcGrowth(10, 0)).toBeUndefined()
    expect(calcGrowth(10, null)).toBeUndefined()
  })

  it('returns 0 when both current and previous are zero', () => {
    expect(calcGrowth(0, 0)).toBe(0)
  })
})
