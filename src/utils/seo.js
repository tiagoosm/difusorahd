export const SITE_NAME = 'Difusora HD'
export const SITE_DESCRIPTION =
  'Acompanhe as principais notícias de política, economia, tecnologia, esportes e cultura.'

// Sem content, remove a tag em vez de só ignorar — numa SPA, sem isso uma
// og:image de uma notícia ficava "grudada" ao navegar pra uma página sem
// imagem (Home, Busca), porque a tag antiga nunca era limpa.
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

// Injeta/atualiza o JSON-LD específico da página (ex: NewsArticle). Sem
// jsonLd, remove qualquer script deixado por uma página anterior — evita
// uma notícia "herdar" o schema de outra ao navegar dentro da SPA.
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

// Schema.org NewsArticle para a página de notícia — ajuda elegibilidade em
// rich results e Google News. Campos opcionais (imagem, autor) só entram no
// objeto quando existem, em vez de mandar valores vazios/inválidos.
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
