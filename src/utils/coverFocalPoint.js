// Single source of truth for the cover image's per-context framing (see
// news.cover_focal_points, a nullable jsonb column — no column means
// "centered, zoom 1," the exact crop every article already had before this
// feature existed, so old/unconfigured articles render identically).
//
// Three contexts, matching the three presentations that actually differ in
// shape across the site (not one per component — see CoverFocalPointEditor):
//   - featured: FeaturedNews hero + secondary items, Category's featured row
//   - card: NewsCard, LatestNewsCard, the article page's own header image
//   - most_read: MostReadNews
export const COVER_CONTEXTS = ['featured', 'card', 'most_read']

// zoom: 1 is the floor — the tightest crop possible while the image still
// fills the box edge-to-edge with no empty border (today's default,
// equivalent to plain object-fit:cover). There is deliberately no "less
// cropped than that" option — showing more of the image than cover allows
// would leave a blank strip wherever the box's aspect ratio doesn't match
// the photo's, which this feature never does. For contexts where that
// floor already crops too tight by default (small square thumbnails —
// Mais Lidas, Destaque's secondary list), the fix is a wider box aspect
// ratio (see MostReadNews.jsx/FeaturedNews.jsx), not a zoom below 1.
// Admins can zoom in from the floor to crop tighter/focus on a detail.
export const DEFAULT_FOCAL_POINT = { x: 50, y: 50, zoom: 1 }
export const MIN_ZOOM = 1
export const MAX_ZOOM = 2.5

function clampPercent(value) {
  return Math.min(100, Math.max(0, value))
}

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

// Reads one context's point out of the raw jsonb column, falling back to
// center/zoom-1 for a missing column, a missing context key, or a malformed
// value (never let bad/old data crash a render). `zoom` is optional even
// when x/y are present — articles saved before zoom existed just get 1.
export function getFocalPoint(coverFocalPoints, context) {
  const point = coverFocalPoints?.[context]
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
    return DEFAULT_FOCAL_POINT
  }
  return {
    x: clampPercent(point.x),
    y: clampPercent(point.y),
    zoom: clampZoom(typeof point.zoom === 'number' ? point.zoom : 1),
  }
}

export function toObjectPosition(point) {
  return `${point.x}% ${point.y}%`
}

// object-position frames the crop exactly as before zoom existed; a zoom
// above 1 adds a transform:scale anchored at that same x%/y% point — pure
// CSS, no image measurement needed. Because object-fit:cover has already
// cropped/positioned the image before the transform applies, scaling from
// that same origin zooms in on precisely the chosen focal point without
// shifting it. zoom===1 (the default) adds no transform at all, so an
// unconfigured article's style is exactly what it was before zoom existed.
//   <img ... style={coverPositionStyle(news.cover_focal_points, 'card')} />
export function coverPositionStyle(coverFocalPoints, context) {
  const point = getFocalPoint(coverFocalPoints, context)
  const position = toObjectPosition(point)
  const style = { objectPosition: position }
  if (point.zoom > 1) {
    style.transform = `scale(${point.zoom})`
    style.transformOrigin = position
  }
  return style
}
