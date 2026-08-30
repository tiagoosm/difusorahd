import { supabase } from './supabase'
import { removeFile } from './storage'

export const CARD_FIELDS =
  'id, title, slug, excerpt, cover_image_url, published_at, category:categories(id, name, slug)'


const DETAIL_FIELDS = `
  id, title, slug, excerpt, content, cover_image_url, cover_image_caption, audio_url, published_at, updated_at,
  category:categories(id, name, slug),
  author:profiles(full_name)
`

export function fetchFeaturedNews(limit = 3) {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('featured_position', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: false })
    .limit(limit)
}

// Full, ordered list of current featured items, for the /admin/destaques
// page (no limit — the admin needs to see and reorder all of them).
export function fetchFeaturedNewsAdmin() {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('featured_position', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: false })
}

// Published articles that aren't featured yet, for the "add featured"
// search. Optional search by title.
export function fetchFeaturableNews(search = '') {
  let query = supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .eq('is_featured', false)
    .order('published_at', { ascending: false })
    .limit(20)

  if (search) query = query.ilike('title', `%${sanitizeSearchTerm(search)}%`)

  return query
}

// Persists the final featured order: whoever is in `orderedIds` becomes
// featured at the corresponding position; whoever was previously marked
// and dropped out of the list gets unmarked. Only called when the admin
// clicks "Save featured" — until then, reordering/adding/removing only
// happens in local state (preview).
export async function saveFeaturedNews(orderedIds) {
  const { data: current } = await supabase.from('news').select('id').eq('is_featured', true)
  const removedIds = (current ?? [])
    .map((item) => item.id)
    .filter((id) => !orderedIds.includes(id))

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('news')
      .update({ is_featured: true, featured_position: index + 1 })
      .eq('id', id),
  )

  if (removedIds.length) {
    updates.push(
      supabase.from('news').update({ is_featured: false, featured_position: null }).in('id', removedIds),
    )
  }

  // Promise.all never rejects on a Supabase request error (only on a
  // network failure) — each result has its own {error}, which must be
  // checked manually, otherwise a permission failure goes unnoticed.
  const results = await Promise.all(updates)
  const failed = results.find((result) => result.error)
  return { error: failed?.error ?? null }
}

export function fetchLatestNews(limit = 6) {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
}

// Current week's ranking (Monday to now), via analytics_events — not
// views_count (that one accumulates since forever and doesn't reflect
// "this week"). Public RPC (SECURITY DEFINER), doesn't expose view counts
// or raw analytics data. Fetches a bit more than what's shown (limit)
// because the caller filters out IDs already shown in Featured/Latest
// before trimming to the final size — avoids repeating the same article
// on the Home page.
export async function fetchWeeklyTopNews(limit = 20) {
  const { data, error } = await supabase.rpc('public_weekly_top_news', { p_limit: limit })
  if (error) return { data: null, error }

  const mapped = (data ?? []).map((row) => ({
    id: row.news_id,
    title: row.title,
    slug: row.slug,
    cover_image_url: row.cover_image_url,
    category: row.category_name
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null,
  }))

  return { data: mapped, error: null }
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

// Strips characters with special meaning in PostgREST's filter syntax
// (.or()), preventing the user's search from breaking or altering the query.
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

// Articles published within a range, for the "News" card on the analytics
// dashboard (period + comparison with the previous one).
export function fetchPublishedNewsCount(start, end) {
  return supabase
    .from('news')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .gte('published_at', start.toISOString())
    .lt('published_at', end.toISOString())
}

export function fetchRecentNews(limit = 5) {
  return supabase
    .from('news')
    .select('id, title, status, created_at, category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(limit)
}

export function createNews(payload) {
  return supabase.from('news').insert(payload).select().single()
}

const ADMIN_LIST_FIELDS =
  'id, title, slug, status, views_count, cover_image_url, published_at, created_at, category:categories(id, name)'

export function fetchAllNewsAdmin({
  status,
  categoryId,
  search,
  sort = 'recent',
  publishedFrom,
  publishedTo,
  page = 1,
  pageSize = 10,
} = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('news').select(ADMIN_LIST_FIELDS, { count: 'exact' }).range(from, to)

  if (status) query = query.eq('status', status)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (publishedFrom) query = query.gte('published_at', publishedFrom)
  // Dates come from <input type="date"> (no time) — without this, "until
  // 2026-07-26" would exclude articles published that same day after midnight.
  if (publishedTo) query = query.lte('published_at', `${publishedTo}T23:59:59`)

  if (search) {
    const term = sanitizeSearchTerm(search)
    query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`)
  }

  if (sort === 'oldest') {
    query = query.order('published_at', { ascending: true, nullsFirst: false })
  } else if (sort === 'views') {
    query = query.order('views_count', { ascending: false })
  } else {
    query = query.order('published_at', { ascending: false, nullsFirst: false })
  }

  return query.order('created_at', { ascending: false })
}

// Stats for the "Manage News" panel's cards. Done in parallel with
// head-only queries (no rows downloaded) to keep it light.
export async function fetchNewsStats() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [total, published, drafts, publishedThisMonth, viewsResult] = await Promise.all([
    supabase.from('news').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('news').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase
      .from('news')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', monthStart),
    supabase.from('news').select('views_count'),
  ])

  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
    publishedThisMonth: publishedThisMonth.count ?? 0,
    totalViews: (viewsResult.data ?? []).reduce((sum, row) => sum + (row.views_count ?? 0), 0),
  }
}

// Supabase/PostgREST returns success (no "error") even when the DELETE
// affects no rows — either because the id doesn't exist, or because the
// session expired and the RLS policy excluded the row from the command's
// scope. Asking for the row back (.select()) is the only way to tell
// "deleted" apart from "found nothing to delete" (e.g. no permission).
export async function deleteNews(id) {
  const { data, error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)
    .select('id, cover_image_url, audio_url')

  if (error) return { deleted: false, error }

  if (!data || data.length === 0) {
    return {
      deleted: false,
      error: { message: 'Nenhuma notícia foi excluída. Confirme se sua sessão ainda está autenticada como administrador.' },
    }
  }

  // Doesn't fail the whole operation over this: the record was already
  // deleted successfully, only the file cleanup couldn't be confirmed.
  const deletedNews = data[0]
  await Promise.all([
    removeFile('news-media', deletedNews.cover_image_url),
    removeFile('news-media', deletedNews.audio_url),
  ])

  return { deleted: true, error: null }
}

export function fetchNewsById(id) {
  return supabase
    .from('news')
    .select(
      'id, title, slug, excerpt, content, cover_image_url, cover_image_caption, audio_url, category_id, status, is_featured',
    )
    .eq('id', id)
    .maybeSingle()
}

export function updateNews(id, payload) {
  return supabase.from('news').update(payload).eq('id', id).select().single()
}
