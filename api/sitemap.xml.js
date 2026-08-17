import { createClient } from '@supabase/supabase-js'

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      default:
        return '&quot;'
    }
  })
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export default async function handler(req, res) {
  // SITE_URL não está configurada no Vercel — sem esse fallback, o sitemap
  // gerava URLs em example.com em vez do domínio real.
  const siteUrl = (process.env.SITE_URL || 'https://difusorahd.com.br').replace(/\/$/, '')
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

  const [{ data: news }, { data: categories }] = await Promise.all([
    supabase.from('news').select('slug, published_at').eq('status', 'published'),
    supabase.from('categories').select('slug'),
  ])

  const entries = [
    { loc: `${siteUrl}/`, changefreq: 'hourly', priority: '1.0' },
    ...(categories ?? []).map((category) => ({
      loc: `${siteUrl}/categoria/${category.slug}`,
      changefreq: 'daily',
      priority: '0.7',
    })),
    ...(news ?? []).map((item) => ({
      loc: `${siteUrl}/noticia/${item.slug}`,
      lastmod: item.published_at ? new Date(item.published_at).toISOString() : undefined,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(buildUrlEntry).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(xml)
}
