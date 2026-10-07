import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAnalyticsTimeseries } from './useAnalyticsTimeseries'

vi.mock('../services/analytics', () => ({ fetchAnalyticsTimeseries: vi.fn() }))

import { fetchAnalyticsTimeseries } from '../services/analytics'

function makeRange(startIso, endIso) {
  return { start: new Date(startIso), end: new Date(endIso) }
}

describe('useAnalyticsTimeseries — happy path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads data and flips loading to false, with no error', async () => {
    fetchAnalyticsTimeseries.mockResolvedValue([
      { bucket: '2026-10-01T03:00:00+00:00', views: 10, visitors: 5 },
      { bucket: '2026-10-02T03:00:00+00:00', views: 0, visitors: 0 },
    ])

    const { result } = renderHook(() => useAnalyticsTimeseries(makeRange('2026-10-01', '2026-10-03')))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.data).toHaveLength(2)
    // The zero-filled bucket survives untouched — not dropped, not NaN.
    expect(result.current.data[1]).toEqual({ bucket: '2026-10-02T03:00:00+00:00', views: 0, visitors: 0 })
  })

  it('picks the hour bucket for short spans and day for long ones', async () => {
    fetchAnalyticsTimeseries.mockResolvedValue([])

    const { result: shortSpan } = renderHook(() => useAnalyticsTimeseries(makeRange('2026-10-06T00:00', '2026-10-06T23:59')))
    await waitFor(() => expect(shortSpan.current.loading).toBe(false))
    expect(shortSpan.current.bucket).toBe('hour')

    const { result: longSpan } = renderHook(() => useAnalyticsTimeseries(makeRange('2026-09-01', '2026-10-06')))
    await waitFor(() => expect(longSpan.current.loading).toBe(false))
    expect(longSpan.current.bucket).toBe('day')
  })
})

describe('useAnalyticsTimeseries — failure does not hang loading forever', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('catches a rejected request: loading resolves to false, error is set, data is empty', async () => {
    fetchAnalyticsTimeseries.mockRejectedValue(new Error('db unreachable'))

    const { result } = renderHook(() => useAnalyticsTimeseries(makeRange('2026-10-01', '2026-10-03')))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.data).toEqual([])
  })

  it('retry() re-runs the request without needing a new range', async () => {
    fetchAnalyticsTimeseries.mockRejectedValueOnce(new Error('db unreachable'))
    fetchAnalyticsTimeseries.mockResolvedValueOnce([{ bucket: '2026-10-01T03:00:00+00:00', views: 7, visitors: 3 }])

    const { result } = renderHook(() => useAnalyticsTimeseries(makeRange('2026-10-01', '2026-10-03')))
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))

    act(() => result.current.retry())

    await waitFor(() =>
      expect(result.current.data).toEqual([{ bucket: '2026-10-01T03:00:00+00:00', views: 7, visitors: 3 }]),
    )
    expect(result.current.error).toBeNull()
    expect(fetchAnalyticsTimeseries).toHaveBeenCalledTimes(2)
  })
})
