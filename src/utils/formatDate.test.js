import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats a date in pt-BR long form', () => {
    expect(formatDate('2026-08-14T12:00:00Z')).toBe('14 de agosto de 2026')
  })

  it('returns an empty string for falsy input instead of "Invalid Date"', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })
})
