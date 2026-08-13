import { supabase } from './supabase'

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

// Views + visitantes únicos num intervalo, para os cards do dashboard admin.
export async function fetchAnalyticsSummary(start, end) {
  const { data, error } = await supabase.rpc('analytics_summary', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  })
  if (error) throw error
  const row = data?.[0]
  return { views: row?.views ?? 0, visitors: row?.visitors ?? 0 }
}

export async function fetchRealtimeVisitors() {
  const { data, error } = await supabase.rpc('analytics_realtime_visitors')
  if (error) throw error
  return data ?? 0
}

// bucket: 'day' | 'hour' — 'hour' faz sentido só para períodos de 1-2 dias
// (Hoje/Ontem); para o resto, agrupar por hora geraria um gráfico ilegível.
export async function fetchAnalyticsTimeseries(start, end, bucket = 'day') {
  const { data, error } = await supabase.rpc('analytics_timeseries', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_bucket: bucket,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchAnalyticsBySource(start, end) {
  const { data, error } = await supabase.rpc('analytics_by_source', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  })
  if (error) throw error
  return data ?? []
}

export async function fetchAnalyticsByCategory(start, end) {
  const { data, error } = await supabase.rpc('analytics_by_category', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  })
  if (error) throw error
  return data ?? []
}

export async function fetchTopNews(start, end, limit = 8) {
  const { data, error } = await supabase.rpc('analytics_top_news', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_limit: limit,
  })
  if (error) throw error
  return data ?? []
}

export async function fetchTopPages(start, end, limit = 10) {
  const { data, error } = await supabase.rpc('analytics_top_pages', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
    p_limit: limit,
  })
  if (error) throw error
  return data ?? []
}
