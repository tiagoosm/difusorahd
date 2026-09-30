import { describe, it, expect } from 'vitest'
import { getPageItems, ELLIPSIS } from './pagination'

describe('getPageItems — ellipsis windowing', () => {
  it('shows every page when there are few enough (no ellipsis needed)', () => {
    expect(getPageItems(1, 5, 2)).toEqual([1, 2, 3, 4, 5])
    expect(getPageItems(3, 5, 2)).toEqual([1, 2, 3, 4, 5])
  })

  it('near the start: window anchored at 1, ellipsis, then the last page', () => {
    expect(getPageItems(1, 20, 2)).toEqual([1, 2, 3, 4, 5, ELLIPSIS, 20])
    expect(getPageItems(2, 20, 2)).toEqual([1, 2, 3, 4, 5, ELLIPSIS, 20])
  })

  it('in the middle: first page, ellipsis, centered window, ellipsis, last page', () => {
    expect(getPageItems(9, 20, 2)).toEqual([1, ELLIPSIS, 7, 8, 9, 10, 11, ELLIPSIS, 20])
  })

  it('near the end: first page, ellipsis, then the window anchored at the last page', () => {
    expect(getPageItems(20, 20, 2)).toEqual([1, ELLIPSIS, 16, 17, 18, 19, 20])
    expect(getPageItems(19, 20, 2)).toEqual([1, ELLIPSIS, 16, 17, 18, 19, 20])
  })

  it('mobile (siblingCount 1) uses a narrower window', () => {
    expect(getPageItems(1, 10, 1)).toEqual([1, 2, 3, ELLIPSIS, 10])
    expect(getPageItems(5, 10, 1)).toEqual([1, ELLIPSIS, 4, 5, 6, ELLIPSIS, 10])
  })
})
