export const SITE_NAME = 'Difusora HD'
export const SITE_DESCRIPTION =
  'Acompanhe as principais notícias de política, economia, tecnologia, esportes e cultura.'

// With no content, remove the tag instead of just skipping it — in an SPA,
// without this an article's og:image would stay "stuck" when navigating to
// a page without an image (Home, Search), because the old tag was never cleared.
function upsertMetaTag(attr, key, content) {
  const element = document.querySelector(`meta[${attr}="${key}"]`)

  if (!content) {
    element?.remove()
    return
  }

  if (element) {
    element.setAttribute('content', content)
    return
  }

  const created = document.createElement('meta')
  created.setAttribute(attr, key)
  created.setAttribute('content', content)
  document.head.appendChild(created)
}

const JSON_LD_ELEMENT_ID = 'page-json-ld'

// Injects/updates the page-specific JSON-LD (e.g. NewsArticle). With no
// jsonLd, removes any script left over from a previous page — avoids one
// article "inheriting" another one's schema when navigating within the SPA.
function upsertJsonLd(jsonLd) {
  const existing = document.getElementById(JSON_LD_ELEMENT_ID)

  if (!jsonLd) {
    existing?.remove()
    return
  }

  const script = existing ?? document.createElement('script')
  script.id = JSON_LD_ELEMENT_ID
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(jsonLd)
  if (!existing) document.head.appendChild(script)
}

// Schema.org NewsArticle for the article page — helps eligibility for rich
// results and Google News. Optional fields (image, author) are only added
// to the object when they exist, instead of sending empty/invalid values.
export function buildNewsArticleJsonLd(news, url) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    datePublished: news.published_at,
    dateModified: news.updated_at || news.published_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Difusora HD',
      logo: { '@type': 'ImageObject', url: 'https://difusorahd.com.br/favicon.png' },
    },
  }

  if (news.excerpt) jsonLd.description = news.excerpt
  if (news.cover_image_url) jsonLd.image = [news.cover_image_url]
  if (news.author?.full_name) jsonLd.author = { '@type': 'Person', name: news.author.full_name }
  if (news.category?.name) jsonLd.articleSection = news.category.name

  return jsonLd
}

export function setSEO({ title, description, image, url, noindex = false, jsonLd }) {
  if (title) document.title = title

  upsertMetaTag('name', 'description', description)
  upsertMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  upsertMetaTag('property', 'og:title', title)
  upsertMetaTag('property', 'og:description', description)
  upsertMetaTag('property', 'og:type', jsonLd?.['@type'] === 'NewsArticle' ? 'article' : 'website')
  upsertMetaTag('property', 'og:url', url ?? window.location.href)
  upsertMetaTag('property', 'og:image', image)
  upsertMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  upsertMetaTag('name', 'twitter:title', title)
  upsertMetaTag('name', 'twitter:description', description)
  upsertMetaTag('name', 'twitter:image', image)
  upsertJsonLd(jsonLd)
}
