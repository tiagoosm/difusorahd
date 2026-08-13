const TRACK_ENDPOINT = '/api/track'

function getUtmParams(search) {
  const params = new URLSearchParams(search)
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  }
}

// Fire-and-forget: uma falha aqui (rede, function fora do ar, etc.) nunca
// deve afetar a navegação do leitor — por isso não retorna a Promise nem
// propaga erro.
export function trackPageView({ page, pageType, newsId, categoryId }) {
  const payload = {
    page,
    page_type: pageType,
    news_id: newsId || undefined,
    category_id: categoryId || undefined,
    referrer: document.referrer || '',
    ...getUtmParams(window.location.search),
  }

  fetch(TRACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}
