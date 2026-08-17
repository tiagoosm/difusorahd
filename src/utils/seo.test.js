import { describe, it, expect, beforeEach } from 'vitest'
import { setSEO, buildNewsArticleJsonLd } from './seo'

function getMeta(attr, key) {
  return document.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content') ?? null
}

describe('setSEO', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('sets title and the description/og/twitter meta tags', () => {
    setSEO({ title: 'Título — Difusora HD', description: 'Resumo da página', image: 'https://x.com/img.png' })

    expect(document.title).toBe('Título — Difusora HD')
    expect(getMeta('name', 'description')).toBe('Resumo da página')
    expect(getMeta('property', 'og:title')).toBe('Título — Difusora HD')
    expect(getMeta('property', 'og:image')).toBe('https://x.com/img.png')
    expect(getMeta('name', 'twitter:card')).toBe('summary_large_image')
  })

  it('removes og:image/twitter:image left over from a previous page when navigating to one without an image', () => {
    setSEO({ title: 'Notícia', description: 'x', image: 'https://x.com/img.png' })
    expect(getMeta('property', 'og:image')).not.toBeNull()

    setSEO({ title: 'Home', description: 'y' })

    expect(getMeta('property', 'og:image')).toBeNull()
    expect(getMeta('name', 'twitter:image')).toBeNull()
  })

  it('removes the JSON-LD script when a page has none, so it does not leak into the next page', () => {
    setSEO({ title: 'Notícia', description: 'x', jsonLd: { '@type': 'NewsArticle' } })
    expect(document.getElementById('page-json-ld')).not.toBeNull()

    setSEO({ title: 'Home', description: 'y' })

    expect(document.getElementById('page-json-ld')).toBeNull()
  })

  it('sets noindex robots when requested', () => {
    setSEO({ title: 'Busca', noindex: true })
    expect(getMeta('name', 'robots')).toBe('noindex, nofollow')
  })
})

describe('buildNewsArticleJsonLd', () => {
  it('builds a NewsArticle schema with the required fields', () => {
    const jsonLd = buildNewsArticleJsonLd(
      {
        title: 'Prefeitura anuncia nova ponte',
        excerpt: 'Obra deve levar seis meses',
        cover_image_url: 'https://x.com/ponte.png',
        published_at: '2026-08-10T12:00:00Z',
        author: { full_name: 'Redação' },
        category: { name: 'Cotidiano' },
      },
      'https://difusorahd.com.br/noticia/prefeitura-anuncia-nova-ponte',
    )

    expect(jsonLd['@type']).toBe('NewsArticle')
    expect(jsonLd.headline).toBe('Prefeitura anuncia nova ponte')
    expect(jsonLd.image).toEqual(['https://x.com/ponte.png'])
    expect(jsonLd.author).toEqual({ '@type': 'Person', name: 'Redação' })
    expect(jsonLd.publisher.name).toBe('Difusora HD')
  })

  it('omits optional fields (image/author/category) instead of sending empty values', () => {
    const jsonLd = buildNewsArticleJsonLd(
      { title: 'Nota rápida', published_at: '2026-08-10T12:00:00Z' },
      'https://difusorahd.com.br/noticia/nota-rapida',
    )

    expect(jsonLd.image).toBeUndefined()
    expect(jsonLd.author).toBeUndefined()
    expect(jsonLd.articleSection).toBeUndefined()
  })
})
