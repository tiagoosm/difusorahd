import { describe, it, expect } from 'vitest'
import { getFocalPoint, toObjectPosition, coverPositionStyle, DEFAULT_FOCAL_POINT } from './coverFocalPoint'

describe('getFocalPoint — fallback to center (old articles / no override)', () => {
  it.each([
    [undefined, 'card'],
    [null, 'card'],
    [{}, 'card'],
    [{ card: null }, 'card'],
    [{ card: { x: 'a', y: 10 } }, 'card'], // malformed, never crash
  ])('falls back to {x:50,y:50} for %j / context %s', (coverFocalPoints, context) => {
    expect(getFocalPoint(coverFocalPoints, context)).toEqual(DEFAULT_FOCAL_POINT)
  })

  it('returns the saved point for the requested context', () => {
    const points = { featured: { x: 20, y: 30 }, card: { x: 65, y: 35 }, most_read: { x: 70, y: 40 } }
    expect(getFocalPoint(points, 'card')).toEqual({ x: 65, y: 35 })
    expect(getFocalPoint(points, 'featured')).toEqual({ x: 20, y: 30 })
    expect(getFocalPoint(points, 'most_read')).toEqual({ x: 70, y: 40 })
  })

  it('clamps out-of-range values instead of producing invalid CSS', () => {
    expect(getFocalPoint({ card: { x: 150, y: -20 } }, 'card')).toEqual({ x: 100, y: 0 })
  })
})

describe('toObjectPosition / coverPositionStyle', () => {
  it('formats a point as a CSS object-position value', () => {
    expect(toObjectPosition({ x: 65, y: 35 })).toBe('65% 35%')
  })

  it('builds a ready style object from the raw column value', () => {
    expect(coverPositionStyle({ card: { x: 10, y: 90 } }, 'card')).toEqual({ objectPosition: '10% 90%' })
  })

  it('defaults to centered style when there is no saved data', () => {
    expect(coverPositionStyle(null, 'featured')).toEqual({ objectPosition: '50% 50%' })
  })
})
