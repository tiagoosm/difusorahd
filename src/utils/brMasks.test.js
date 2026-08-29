import { describe, it, expect } from 'vitest'
import { formatPhoneBR, formatCepBR, onlyDigits } from './brMasks'

describe('formatPhoneBR', () => {
  it('formats progressively as digits are typed', () => {
    expect(formatPhoneBR('3')).toBe('(3')
    expect(formatPhoneBR('35')).toBe('(35')
    expect(formatPhoneBR('359')).toBe('(35) 9')
    expect(formatPhoneBR('35999')).toBe('(35) 999')
  })

  it('formats a complete cell phone (11 digits, 9xxxx-xxxx)', () => {
    expect(formatPhoneBR('35999998888')).toBe('(35) 99999-8888')
  })

  it('formats a complete landline (10 digits, xxxx-xxxx)', () => {
    expect(formatPhoneBR('3532001234')).toBe('(35) 3200-1234')
  })

  it('ignores non-digit characters already present (re-formatting a masked value)', () => {
    expect(formatPhoneBR('(35) 99999-8888')).toBe('(35) 99999-8888')
  })

  it('caps at 11 digits, ignoring anything typed beyond that', () => {
    expect(formatPhoneBR('359999988889999')).toBe('(35) 99999-8888')
  })

  it('returns an empty string for empty input', () => {
    expect(formatPhoneBR('')).toBe('')
    expect(formatPhoneBR(undefined)).toBe('')
  })
})

describe('formatCepBR', () => {
  it('formats progressively', () => {
    expect(formatCepBR('375')).toBe('375')
    expect(formatCepBR('37550')).toBe('37550')
    expect(formatCepBR('37550000')).toBe('37550-000')
  })

  it('caps at 8 digits', () => {
    expect(formatCepBR('375500001234')).toBe('37550-000')
  })
})

describe('onlyDigits', () => {
  it('strips everything but digits', () => {
    expect(onlyDigits('(35) 99999-8888')).toBe('35999998888')
    expect(onlyDigits('MG-12.345.678')).toBe('12345678')
  })

  it('handles empty/nullish input', () => {
    expect(onlyDigits('')).toBe('')
    expect(onlyDigits(undefined)).toBe('')
  })
})
