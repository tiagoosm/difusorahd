import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollDirectionVisibility } from './useScrollDirectionVisibility'

// requestAnimationFrame runs synchronously in these tests (instead of
// waiting for the next paint) so each scroll event's effect is
// immediately observable, without needing real timers/frames.
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    cb()
    return 0
  })
  window.scrollY = 0
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function scrollTo(y) {
  window.scrollY = y
  window.dispatchEvent(new Event('scroll'))
}

describe('useScrollDirectionVisibility', () => {
  it('starts visible', () => {
    const { result } = renderHook(() => useScrollDirectionVisibility())
    expect(result.current).toBe(true)
  })

  it('hides after scrolling down past the delta threshold', () => {
    const { result } = renderHook(() => useScrollDirectionVisibility())

    act(() => scrollTo(200))

    expect(result.current).toBe(false)
  })

  it('shows again after scrolling up past the delta threshold', () => {
    const { result } = renderHook(() => useScrollDirectionVisibility())

    act(() => scrollTo(200))
    expect(result.current).toBe(false)

    act(() => scrollTo(150))

    expect(result.current).toBe(true)
  })

  it('ignores small movements below the delta threshold (no flicker)', () => {
    const { result } = renderHook(() => useScrollDirectionVisibility())

    act(() => scrollTo(200))
    expect(result.current).toBe(false)

    act(() => scrollTo(203))

    expect(result.current).toBe(false)
  })

  it('is always visible at/near the top of the page, even right after scrolling down', () => {
    const { result } = renderHook(() => useScrollDirectionVisibility())

    act(() => scrollTo(200))
    expect(result.current).toBe(false)

    act(() => scrollTo(5))

    expect(result.current).toBe(true)
  })

  it('respects custom thresholds', () => {
    const { result } = renderHook(() =>
      useScrollDirectionVisibility({ topThreshold: 0, deltaThreshold: 100 }),
    )

    act(() => scrollTo(50))
    expect(result.current).toBe(true)

    act(() => scrollTo(160))
    expect(result.current).toBe(false)
  })
})
