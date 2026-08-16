import { describe, it, expect } from 'vitest'
import { estimateReadingTime } from './readingTime'

describe('estimateReadingTime', () => {
  it('returns 1 minute for empty content', () => {
    expect(estimateReadingTime('')).toBe(1)
    expect(estimateReadingTime(null)).toBe(1)
  })

  it('strips HTML tags before counting words', () => {
    const html = '<p>Uma <strong>frase</strong> curta.</p>'
    expect(estimateReadingTime(html)).toBe(1)
  })

  it('estimates ~200 words per minute, rounded, minimum of 1', () => {
    const words = Array.from({ length: 600 }, () => 'palavra').join(' ')
    expect(estimateReadingTime(`<p>${words}</p>`)).toBe(3)
  })
})
