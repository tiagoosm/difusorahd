import { supabase } from '../supabase'

const AD_FIELDS =
  'id, title, image_url, link_url, position, active, start_date, end_date, priority, created_at, updated_at'

// Consulta pública: o único anúncio a exibir numa posição (RLS já garante
// que só anúncios ativos e dentro do período chegam até aqui).
export function fetchActiveAd(position) {
  return supabase
    .from('ads')
    .select('id, title, image_url, link_url, position')
    .eq('position', position)
    .order('priority', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export function fetchAllAdsAdmin({ position, page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('ads')
    .select(AD_FIELDS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (position) query = query.eq('position', position)

  return query
}

export function fetchAdById(id) {
  return supabase.from('ads').select(AD_FIELDS).eq('id', id).maybeSingle()
}

export function createAd(payload) {
  return supabase.from('ads').insert(payload).select().single()
}

export function updateAd(id, payload) {
  return supabase.from('ads').update(payload).eq('id', id).select().single()
}

export function deleteAd(id) {
  return supabase.from('ads').delete().eq('id', id)
}
