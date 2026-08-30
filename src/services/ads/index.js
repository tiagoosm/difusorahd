import { supabase } from '../supabase'
import { removeFile } from '../storage'

const AD_FIELDS =
  'id, title, image_url, link_url, position, active, start_date, end_date, priority, created_at, updated_at'

// Public query: every valid ad in a position, highest to lowest priority
// (RLS already ensures only active ads within their date range reach this
// point). A high limit avoids an absurd carousel in case someone registers
// dozens of ads in the same position.
export function fetchAdsForPosition(position, limit = 10) {
  return supabase
    .from('ads')
    .select('id, title, image_url, link_url, position')
    .eq('position', position)
    .order('priority', { ascending: false })
    .limit(limit)
}

export function fetchAllAdsAdmin({ position, status, search, sort = 'priority', page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const nowIso = new Date().toISOString()

  let query = supabase
    .from('ads')
    .select(AD_FIELDS, { count: 'exact' })
    .range(from, to)

  if (position) query = query.eq('position', position)
  if (search) query = query.ilike('title', `%${search}%`)

  if (status === 'active') {
    query = query.eq('active', true).lte('start_date', nowIso).gte('end_date', nowIso)
  } else if (status === 'scheduled') {
    query = query.eq('active', true).gt('start_date', nowIso)
  } else if (status === 'expired') {
    query = query.eq('active', true).lt('end_date', nowIso)
  } else if (status === 'inactive') {
    query = query.eq('active', false)
  }

  query =
    sort === 'recent'
      ? query.order('created_at', { ascending: false })
      : query.order('priority', { ascending: false })

  return query
}

export async function fetchAdCountsByPosition() {
  const { data } = await supabase.from('ads').select('position')
  const counts = {}

  for (const row of data ?? []) {
    counts[row.position] = (counts[row.position] ?? 0) + 1
  }

  return counts
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

// Takes the whole ad (not just the id) because it needs image_url to also
// clean up the file in Storage.
//
// IMPORTANT: Supabase/PostgREST returns success (204, no "error") even when
// a DELETE affects no rows — either because the id doesn't exist, or
// because the RLS policy silently excluded the row from the command's
// scope. That's why we ask for the row back (.select()) and check whether
// it actually came back: it's the only way to tell "deleted" apart from
// "found nothing to delete".
export async function deleteAd(ad) {
  const { data, error } = await supabase.from('ads').delete().eq('id', ad.id).select()

  if (error) {
    return { deleted: false, error }
  }

  if (!data || data.length === 0) {
    return {
      deleted: false,
      error: { message: 'Nenhum anúncio foi excluído. Confirme se sua sessão ainda está autenticada como administrador.' },
    }
  }

  // Doesn't fail the whole operation over this: the record was already
  // deleted successfully, only the file cleanup couldn't be confirmed.
  await removeFile('ads-images', ad.image_url)

  return { deleted: true, error: null }
}
