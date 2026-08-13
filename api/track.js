import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

// Padroniza a origem do acesso a partir de utm_source (prioridade) ou do
// hostname do referrer. Só cobre os canais que o dashboard mostra como
// categorias fixas — qualquer outra coisa cai em "Referral"/"Outros".
const KNOWN_SOURCES = [
  { match: /google/, label: 'Google' },
  { match: /facebook|fb\.com/, label: 'Facebook' },
  { match: /instagram/, label: 'Instagram' },
  { match: /(^|\.)x\.com$|twitter/, label: 'X' },
  { match: /youtube|youtu\.be/, label: 'YouTube' },
  { match: /whatsapp|wa\.me/, label: 'WhatsApp' },
]

function classifySource({ utmSource, referrerHost, siteHost }) {
  if (utmSource) {
    const known = KNOWN_SOURCES.find((entry) => entry.match.test(utmSource.toLowerCase()))
    if (known) return known.label
    return utmSource.charAt(0).toUpperCase() + utmSource.slice(1)
  }

  if (!referrerHost || referrerHost === siteHost) return 'Direto'

  const known = KNOWN_SOURCES.find((entry) => entry.match.test(referrerHost))
  if (known) return known.label

  return 'Referral'
}

function parseUserAgent(ua = '') {
  const isTablet = /iPad|Tablet/i.test(ua)
  const isMobile = !isTablet && /Mobi|Android|iPhone/i.test(ua)
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  // iPhone/iPad UAs contêm "like Mac OS X" — precisam ser checados antes do
  // macOS, senão todo iOS seria classificado como desktop Mac.
  let os = 'Outro'
  if (/Windows/i.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser = 'Outro'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/OPR\//i.test(ua)) browser = 'Opera'
  else if (/Chrome\//i.test(ua)) browser = 'Chrome'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Safari\//i.test(ua)) browser = 'Safari'

  return { deviceType, browser, os }
}

function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const {
      page,
      page_type: pageType,
      news_id: newsId,
      category_id: categoryId,
      referrer,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    } = req.body ?? {}

    if (!page) {
      res.status(400).json({ error: 'page is required' })
      return
    }

    // Geolocalização e IP nunca chegam ao navegador: só existem aqui, na
    // function serverless. O IP é usado só para calcular o hash abaixo e
    // nunca é persistido.
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    const userAgent = req.headers['user-agent'] || ''
    const country = req.headers['x-vercel-ip-country'] || null
    const region = req.headers['x-vercel-ip-country-region'] || null
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null

    const referrerHost = referrer ? extractHostname(referrer) : null
    const siteHost = extractHostname(process.env.SITE_URL || '')
    const source = classifySource({ utmSource, referrerHost, siteHost })
    const { deviceType, browser, os } = parseUserAgent(userAgent)

    // Hash diário (não reversível): identifica "o mesmo visitante hoje" sem
    // guardar o IP em lugar nenhum, e sem cookie/armazenamento no navegador.
    const today = new Date().toISOString().slice(0, 10)
    const visitorHash = crypto
      .createHash('sha256')
      .update(`${ip}:${userAgent}:${today}:${process.env.ANALYTICS_SALT || ''}`)
      .digest('hex')

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

    const { error } = await supabase.rpc('log_analytics_event', {
      payload: {
        page,
        page_type: pageType || 'other',
        news_id: newsId || null,
        category_id: categoryId || null,
        referrer_host: referrerHost,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        source,
        device_type: deviceType,
        browser,
        os,
        country,
        region,
        city,
        visitor_hash: visitorHash,
      },
    })

    if (error) {
      console.error('log_analytics_event failed', error)
      res.status(500).json({ error: 'failed to log event' })
      return
    }

    res.status(204).end()
  } catch (err) {
    console.error('track handler error', err)
    res.status(500).json({ error: 'internal error' })
  }
}
