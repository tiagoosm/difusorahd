import { createClient } from '@supabase/supabase-js'

// Servida só para bots (ver o rewrite condicional em vercel.json) — visitantes
// reais continuam recebendo a SPA normalmente. Existe porque bots de preview
// de link (WhatsApp, Facebook, Telegram...) não executam JavaScript: sem
// isso, eles só veem as meta tags genéricas e estáticas do index.html em vez
// do título/imagem reais da notícia, mesmo o site já atualizando essas tags
// corretamente via JS para quem abre no navegador.
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}

// JSON.stringify não escapa "<" — um "</script" dentro de um valor (ex: um
// título de notícia) fecharia a tag prematuramente quando o HTML é
// parseado pelo navegador/bot, cortando o resto do documento.
function safeJsonLd(jsonLd) {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c')
}

function renderHtml({ siteUrl, pageUrl, title, description, image, jsonLd }) {
  const escapedTitle = escapeHtml(title)
  const escapedDescription = escapeHtml(description)

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${escapedTitle}</title>
<meta name="description" content="${escapedDescription}" />
<link rel="canonical" href="${escapeHtml(pageUrl)}" />
<meta property="og:site_name" content="Difusora HD" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${escapedTitle}" />
<meta property="og:description" content="${escapedDescription}" />
<meta property="og:url" content="${escapeHtml(pageUrl)}" />
${image ? `<meta property="og:image" content="${escapeHtml(image)}" />\n` : ''}<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:title" content="${escapedTitle}" />
<meta name="twitter:description" content="${escapedDescription}" />
${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />\n` : ''}${jsonLd ? `<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>\n` : ''}</head>
<body>
<h1>${escapedTitle}</h1>
${image ? `<img src="${escapeHtml(image)}" alt="" />\n` : ''}<p>${escapedDescription}</p>
<a href="${escapeHtml(pageUrl)}">${escapeHtml(siteUrl)}</a>
</body>
</html>`
}

export default async function handler(req, res) {
  const { slug } = req.query
  const siteUrl = (process.env.SITE_URL || 'https://difusorahd.com.br').replace(/\/$/, '')
  const pageUrl = `${siteUrl}/noticia/${slug}`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  const { data: news } = await supabase
    .from('news')
    .select(
      'title, slug, excerpt, cover_image_url, published_at, updated_at, category:categories(name), author:profiles(full_name)',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!news) {
    res.status(404).send(
      renderHtml({
        siteUrl,
        pageUrl,
        title: 'Notícia não encontrada — Difusora HD',
        description: 'Esta notícia pode ter sido removida ou o link está incorreto.',
      }),
    )
    return
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    datePublished: news.published_at,
    dateModified: news.updated_at || news.published_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Difusora HD',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.png` },
    },
    ...(news.excerpt ? { description: news.excerpt } : {}),
    ...(news.cover_image_url ? { image: [news.cover_image_url] } : {}),
    ...(news.author?.full_name ? { author: { '@type': 'Person', name: news.author.full_name } } : {}),
    ...(news.category?.name ? { articleSection: news.category.name } : {}),
  }

  res.status(200).send(
    renderHtml({
      siteUrl,
      pageUrl,
      title: `${news.title} — Difusora HD`,
      description: news.excerpt || 'Acompanhe as principais notícias da região no Difusora HD.',
      image: news.cover_image_url,
      jsonLd,
    }),
  )
}
