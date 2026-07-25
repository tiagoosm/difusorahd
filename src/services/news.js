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
