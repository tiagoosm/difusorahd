// Single source of truth for the cover image's per-context focal point
// (see news.cover_focal_points, a nullable jsonb column — no column means
// "centered," same as object-cover's own implicit default, so old articles
// render identically to before this feature existed).
//
// Three contexts, matching the three presentations that actually differ in
// shape across the site (not one per component — see CoverFocalPointEditor):
//   - featured: FeaturedNews hero + secondary items, Category's featured row
//   - card: NewsCard, LatestNewsCard, the article page's own header image
//   - most_read: MostReadNews
export const COVER_CONTEXTS = ['featured', 'card', 'most_read']

export const DEFAULT_FOCAL_POINT = { x: 50, y: 50 }

function clampPercent(value) {
  return Math.min(100, Math.max(0, value))
}

// Reads one context's point out of the raw jsonb column, falling back to
// center for a missing column, a missing context key, or a malformed value
// (never let bad/old data crash a render).
export function getFocalPoint(coverFocalPoints, context) {
  const point = coverFocalPoints?.[context]
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
    return DEFAULT_FOCAL_POINT
  }
  return { x: clampPercent(point.x), y: clampPercent(point.y) }
}

export function toObjectPosition(point) {
  return `${point.x}% ${point.y}%`
}

// Ready-to-spread `style` prop — the one-liner every cover-image call site uses:
//   <img ... style={coverPositionStyle(news.cover_focal_points, 'card')} />
export function coverPositionStyle(coverFocalPoints, context) {
  return { objectPosition: toObjectPosition(getFocalPoint(coverFocalPoints, context)) }
}
