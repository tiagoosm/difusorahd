import { describe, it, expect } from 'vitest'
import { getFocalPoint, toObjectPosition, coverPositionStyle, DEFAULT_FOCAL_POINT, MIN_ZOOM, MAX_ZOOM } from './coverFocalPoint'

describe('getFocalPoint — fallback to center/zoom-1 (old articles / no override)', () => {
  it.each([
    [undefined, 'card'],
    [null, 'card'],
    [{}, 'card'],
    [{ card: null }, 'card'],
    [{ card: { x: 'a', y: 10 } }, 'card'], // malformed, never crash
  ])('falls back to {x:50,y:50,zoom:1} for %j / context %s', (coverFocalPoints, context) => {
    expect(getFocalPoint(coverFocalPoints, context)).toEqual(DEFAULT_FOCAL_POINT)
  })

  it('returns the saved point for the requested context', () => {
    const points = {
      featured: { x: 20, y: 30, zoom: 1.5 },
      card: { x: 65, y: 35, zoom: 1 },
      most_read: { x: 70, y: 40, zoom: 2 },
    }
    expect(getFocalPoint(points, 'card')).toEqual({ x: 65, y: 35, zoom: 1 })
    expect(getFocalPoint(points, 'featured')).toEqual({ x: 20, y: 30, zoom: 1.5 })
    expect(getFocalPoint(points, 'most_read')).toEqual({ x: 70, y: 40, zoom: 2 })
  })

  it('defaults zoom to 1 for a point saved before zoom existed', () => {
    expect(getFocalPoint({ card: { x: 65, y: 35 } }, 'card')).toEqual({ x: 65, y: 35, zoom: 1 })
  })

  it('clamps out-of-range x/y instead of producing invalid CSS', () => {
    expect(getFocalPoint({ card: { x: 150, y: -20 } }, 'card')).toEqual({ x: 100, y: 0, zoom: 1 })
  })

  it.each([
    [0.4, MIN_ZOOM], // below the floor — there's no "less cropped than cover" without a border
    [-1, MIN_ZOOM],
    [99, MAX_ZOOM],
  ])('clamps zoom %j to %j (zoom never goes below the no-border floor)', (zoom, expected) => {
    expect(getFocalPoint({ card: { x: 50, y: 50, zoom } }, 'card').zoom).toBe(expected)
  })
})

describe('toObjectPosition / coverPositionStyle', () => {
  it('formats a point as a CSS object-position value', () => {
    expect(toObjectPosition({ x: 65, y: 35 })).toBe('65% 35%')
  })

  it('at zoom 1 (the default), adds no transform — byte-identical to the pre-zoom feature', () => {
    expect(coverPositionStyle({ card: { x: 10, y: 90, zoom: 1 } }, 'card')).toEqual({ objectPosition: '10% 90%' })
    expect(coverPositionStyle(null, 'featured')).toEqual({ objectPosition: '50% 50%' })
  })

  it('above zoom 1, adds a transform:scale anchored at the same point (never shifts the chosen focus)', () => {
    expect(coverPositionStyle({ card: { x: 20, y: 80, zoom: 1.8 } }, 'card')).toEqual({
      objectPosition: '20% 80%',
      transform: 'scale(1.8)',
      transformOrigin: '20% 80%',
    })
  })
})
