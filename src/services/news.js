import { supabase } from './supabase'

export const CARD_FIELDS =
  'id, title, slug, excerpt, cover_image_url, published_at, category:categories(id, name, slug)'

// Sem views_count no select: o ranking usa a coluna pra ordenar no banco,
// mas o valor não deve chegar ao navegador (não é exibido publicamente).
const MOST_READ_FIELDS = 'id, title, slug, cover_image_url, category:categories(id, name, slug)'

const DETAIL_FIELDS = `
  id, title, slug, excerpt, content, cover_image_url, cover_image_caption, audio_url, published_at,
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

// Lista completa e ordenada dos destaques atuais, para a página
// /admin/destaques (sem limite — o admin precisa ver e reordenar todos).
export function fetchFeaturedNewsAdmin() {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('featured_position', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: false })
}

// Notícias publicadas que ainda não são destaque, para o buscador de
// "adicionar destaque". Busca opcional por título.
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

// Persiste a ordem final dos destaques: quem está em `orderedIds` vira
// destaque na posição correspondente; quem estava marcado antes e saiu da
// lista é desmarcado. Chamado só quando o admin clica em "Salvar destaques"
// — até lá, a reordenação/adição/remoção acontece só no estado local (preview).
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

  return Promise.all(updates)
}

export function fetchLatestNews(limit = 6) {
  return supabase
    .from('news')
    .select(CARD_FIELDS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
}

// Ranking "de todos os tempos" via views_count (contador já existente,
// nenhuma contagem nova). Busca um pouco mais que o exibido (limit) porque
// quem chama filtra fora IDs já mostrados em Destaques/Últimas antes de
// cortar pro tamanho final — evita repetir a mesma notícia na Home.
export function fetchMostReadNews(limit = 15) {
  return supabase
    .from('news')
    .select(MOST_READ_FIELDS)
    .eq('status', 'published')
    .order('views_count', { ascending: false })
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

// Notícias publicadas num intervalo, para o card "Notícias" do dashboard de
// analytics (período + comparação com o anterior).
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
  // Datas vêm de <input type="date"> (sem horário) — sem isso, "até 2026-07-26"
  // excluiria notícias publicadas naquele próprio dia depois da meia-noite.
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

// Estatísticas para os cards do painel "Gerenciar Notícias". Feito em
// paralelo com queries head-only (sem baixar linhas) para manter leve.
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

export function deleteNews(id) {
  return supabase.from('news').delete().eq('id', id)
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
