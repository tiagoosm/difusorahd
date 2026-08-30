// Resizes Supabase Storage images on demand via the transform endpoint
// (/render/image/ instead of /object/), avoiding serving the original file
// (sometimes several MB) for a 300px-wide card. Confirmed the transform
// is enabled on this project before using this in production.
const OBJECT_PATH = '/storage/v1/object/public/'
const RENDER_PATH = '/storage/v1/render/image/public/'

export function optimizedImageUrl(url, { width, quality = 75 } = {}) {
  if (!url || !url.includes(OBJECT_PATH)) return url

  const transformed = url.replace(OBJECT_PATH, RENDER_PATH)
  const params = new URLSearchParams({ quality: String(quality) })
  if (width) params.set('width', String(width))

  return `${transformed}?${params}`
}

// Builds the srcset attribute with one variant per width, so the browser
// can pick the smallest image that's enough for the visitor's screen/density.
export function buildSrcSet(url, widths) {
  if (!url || !url.includes(OBJECT_PATH)) return undefined
  return widths.map((width) => `${optimizedImageUrl(url, { width })} ${width}w`).join(', ')
}
