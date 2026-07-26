import { supabase } from '../supabase'

const AD_FIELDS =
  'id, title, image_url, link_url, position, active, start_date, end_date, priority, created_at, updated_at'

// Consulta pública: todos os anúncios válidos numa posição, do maior para o
// menor prioridade (RLS já garante que só anúncios ativos e dentro do
// período chegam até aqui). Um limite alto evita um carrossel absurdo caso
// alguém cadastre dezenas de anúncios na mesma posição.
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

// Extrai o caminho interno do arquivo (ex: "banners/abc.png") a partir da
// URL pública que o Storage retorna, para poder chamar .remove() nele.
function extractStoragePath(publicUrl, bucket) {
  if (!publicUrl) return null
  const marker = `/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  return index === -1 ? null : publicUrl.slice(index + marker.length)
}

// Recebe o anúncio inteiro (não só o id) porque precisa da image_url para
// também limpar o arquivo no Storage.
//
// IMPORTANTE: o Supabase/PostgREST retorna sucesso (204, sem "error") mesmo
// quando um DELETE não afeta nenhuma linha — seja porque o id não existe,
// seja porque a política de RLS excluiu silenciosamente a linha do escopo do
// comando. Por isso pedimos a linha de volta (.select()) e conferimos se ela
// realmente veio: é a única forma de diferenciar "excluiu" de "não achou
// nada para excluir".
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

  const path = extractStoragePath(ad.image_url, 'ads-images')
  if (path) {
    // Não falha a operação inteira por isso: o registro já foi excluído com
    // sucesso, só a limpeza do arquivo não pôde ser confirmada.
    await supabase.storage.from('ads-images').remove([path])
  }

  return { deleted: true, error: null }
}
