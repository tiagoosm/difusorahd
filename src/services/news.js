import { supabase } from './supabase'

const CARD_FIELDS = 'id, title, slug, excerpt, cover_image_url, published_at, category:categories(name, slug)'

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
