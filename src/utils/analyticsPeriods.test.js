import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getPeriodRange } from './analyticsPeriods'

// Pins "now" so the tests don't depend on the day they run.
const FIXED_NOW = new Date('2026-08-16T15:30:00')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getPeriodRange', () => {
  it('today: starts at midnight and ends now, previous period is yesterday', () => {
    const { start, end, previousStart, previousEnd } = getPeriodRange('today')

    expect(start.toISOString()).toBe(new Date('2026-08-16T00:00:00').toISOString())
    expect(end).toEqual(FIXED_NOW)
    expect(previousStart.toISOString()).toBe(new Date('2026-08-15T00:00:00').toISOString())
    expect(previousEnd).toEqual(start)
  })

  it('last7: 7-day window with an equal-length previous window right before it', () => {
    const { start, previousStart, previousEnd } = getPeriodRange('last7')

    expect(start.toISOString()).toBe(new Date('2026-08-09T00:00:00').toISOString())
    expect(previousStart.toISOString()).toBe(new Date('2026-08-02T00:00:00').toISOString())
    expect(previousEnd).toEqual(start)
  })

  it('defaults to last7 for an unknown period', () => {
    expect(getPeriodRange('not-a-real-period')).toEqual(getPeriodRange('last7'))
  })

  it('custom: derives an equal-length previous window from the given range', () => {
    const { start, end, previousStart, previousEnd } = getPeriodRange('custom', {
      from: '2026-08-01',
      to: '2026-08-05',
    })

    const durationMs = end.getTime() - start.getTime()
    expect(previousEnd).toEqual(start)
    expect(start.getTime() - previousStart.getTime()).toBe(durationMs)
  })
})
