import { describe, it, expect, vi, beforeEach } from 'vitest'

const maybeSingle = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle }),
        }),
      }),
    }),
  }),
}))

function createMockRes() {
  return {
    headers: {},
    statusCode: null,
    body: '',
    setHeader(key, value) {
      this.headers[key] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    send(body) {
      this.body = body
    },
  }
}

describe('api/share/[slug] — HTML pré-renderizado para bots de preview', () => {
  beforeEach(() => {
    vi.resetModules()
    maybeSingle.mockReset()
    process.env.SITE_URL = 'https://difusorahd.com.br'
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anon-key'
  })

  it('returns the real article title/image/description in the meta tags', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        title: 'Prefeitura anuncia nova ponte',
        excerpt: 'Obra deve levar seis meses',
        cover_image_url: 'https://example.com/ponte.png',
        published_at: '2026-08-10T12:00:00Z',
        updated_at: '2026-08-11T12:00:00Z',
        category: { name: 'Cotidiano' },
        author: { full_name: 'Redação' },
      },
    })

    const { default: handler } = await import('./[slug].js')
    const req = { query: { slug: 'prefeitura-anuncia-nova-ponte' } }
    const res = createMockRes()
    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('Prefeitura anuncia nova ponte — Difusora HD')
    expect(res.body).toContain('property="og:image" content="https://example.com/ponte.png"')
    expect(res.body).toContain('Obra deve levar seis meses')
    expect(res.body).toContain('"@type":"NewsArticle"')
    expect(res.body).toContain(
      'href="https://difusorahd.com.br/noticia/prefeitura-anuncia-nova-ponte"',
    )
  })

  it('escapes HTML-sensitive characters in the title/excerpt', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        title: '<script>alert(1)</script> & "aspas"',
        excerpt: null,
        cover_image_url: null,
        published_at: '2026-08-10T12:00:00Z',
      },
    })

    const { default: handler } = await import('./[slug].js')
    const res = createMockRes()
    await handler({ query: { slug: 'x' } }, res)

    expect(res.body).not.toContain('<script>alert(1)</script>')
    expect(res.body).toContain('&lt;script&gt;')
  })

  it('returns 404 with a generic fallback when the article does not exist', async () => {
    maybeSingle.mockResolvedValue({ data: null })

    const { default: handler } = await import('./[slug].js')
    const res = createMockRes()
    await handler({ query: { slug: 'nao-existe' } }, res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toContain('Notícia não encontrada')
  })
})
