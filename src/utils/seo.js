export const SITE_NAME = 'Difusora HD'
export const SITE_DESCRIPTION =
  'Acompanhe as principais notícias de política, economia, tecnologia, esportes e cultura.'

function upsertMetaTag(attr, key, content) {
  if (!content) return

  let element = document.querySelector(`meta[${attr}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function setSEO({ title, description, image, url, noindex = false }) {
  if (title) document.title = title

  upsertMetaTag('name', 'description', description)
  upsertMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  upsertMetaTag('property', 'og:title', title)
  upsertMetaTag('property', 'og:description', description)
  upsertMetaTag('property', 'og:type', 'website')
  upsertMetaTag('property', 'og:url', url ?? window.location.href)
  upsertMetaTag('property', 'og:image', image)
  upsertMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  upsertMetaTag('name', 'twitter:title', title)
  upsertMetaTag('name', 'twitter:description', description)
  upsertMetaTag('name', 'twitter:image', image)
}
