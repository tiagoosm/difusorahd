import { supabase } from './supabase'

export const CARD_FIELDS =
  'id, title, slug, excerpt, cover_image_url, published_at, category:categories(id, name, slug)'

const DETAIL_FIELDS = `
  id, title, slug, excerpt, content, cover_image_url, published_at, views_count,
  category:categories(id, name, slug),
  author:profiles(full_name)
`

export function fetchFeaturedNews(limit = 3) {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
}

export function fetchLatestNews(limit = 6) {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
}

export function fetchNewsBySlug(slug) {
  return supabase.from('news').select(DETAIL_FIELDS).eq('status', 'published').eq('slug', slug).maybeSingle()
}

export function fetchRelatedNews({ categoryId, excludeId, limit = 3 }) {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit)
}

export function incrementNewsViews(slug) {
  return supabase.rpc('increment_news_views', { news_slug: slug })
}

export function fetchNewsByCategory({ categoryId, page = 1, pageSize = 9 }) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  return supabase
    .from('news')
    .select(CARD_FIELDS, { count: 'exact' })
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })
    .range(from, to)
}

// Remove caracteres com significado especial na sintaxe de filtro do PostgREST (.or()),
// evitando que a busca do usuário quebre ou altere a query.
function sanitizeSearchTerm(term) {
  return term.replace(/[,()]/g, ' ').trim()
}

export function searchNews({ query, page = 1, pageSize = 9 }) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const term = sanitizeSearchTerm(query)

  return supabase
    .from('news')
    .select(CARD_FIELDS, { count: 'exact' })
    .eq('status', 'published')
    .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
    .order('published_at', { ascending: false })
    .range(from, to)
}

export function fetchNewsCountByStatus(status) {
  return supabase.from('news').select('id', { count: 'exact', head: true }).eq('status', status)
}

export async function fetchPublishedViewsSum() {
  const { data } = await supabase.from('news').select('views_count').eq('status', 'published')
  return (data ?? []).reduce((sum, row) => sum + (row.views_count ?? 0), 0)
}

export function fetchRecentNews(limit = 5) {
  return supabase
    .from('news')
    .select('id, title, status, created_at, category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
}
