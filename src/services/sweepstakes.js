import { supabase } from './supabase'

// No ID/phone/address here: the admin listing doesn't need that sensitive
// data to render the table — only the detail view (fetchById) loads the
// full record. Minimizes what's transferred even for an already
// authenticated admin.
const LIST_FIELDS = 'id, full_name, phone, address_city, status, created_at'
const DETAIL_FIELDS =
  'id, full_name, phone, rg, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zip_code, status, consent_accepted, consent_at, created_at, updated_at'

// Same care as sanitizeSearchTerm in services/news.js: strips characters
// with special meaning in PostgREST's filter syntax (.or()).
function sanitizeSearchTerm(term) {
  return term.replace(/[,()]/g, ' ').trim()
}

// Public registration — the only way to write to this table (see
// RLS/migration: there's no direct INSERT policy, only this SECURITY
// DEFINER function). Returns only the new registration's id, never the
// submitted data back.
export async function registerSweepstakesParticipant({ fullName, phone, rg, address, consentAccepted }) {
  const { data, error } = await supabase.rpc('register_sweepstakes_participant', {
    p_full_name: fullName,
    p_phone: phone,
    p_rg: rg,
    p_address_street: address.street,
    p_address_number: address.number,
    p_address_complement: address.complement || null,
    p_address_neighborhood: address.neighborhood,
    p_address_city: address.city,
    p_address_state: address.state,
    p_address_zip_code: address.zipCode || null,
    p_consent_accepted: consentAccepted,
  })

  return { id: data ?? null, error }
}

// The database's error messages (see register_sweepstakes_participant)
// already come ready for the end user — this only guards against an
// unexpected error (network, etc.) leaking technical text.
const KNOWN_ERROR_PATTERN =
  /já está cadastrado|nome completo|telefone válido|RG válido|endereço completo|aceitar os termos/i

export function describeSweepstakesError(error) {
  const message = error?.message || ''
  if (KNOWN_ERROR_PATTERN.test(message)) return message
  return 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.'
}

export function fetchSweepstakesParticipantsAdmin({
  search,
  status,
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 10,
} = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('sweepstakes_participants')
    .select(LIST_FIELDS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  // Dates come from <input type="date"> (no time) — without this, "until
  // 2026-07-26" would exclude registrations made that same day after
  // midnight (same adjustment already used in fetchAllNewsAdmin).
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`)

  if (search) {
    const term = sanitizeSearchTerm(search)
    const digits = term.replace(/\D/g, '')
    const alnum = term.replace(/[^0-9A-Za-z]/g, '').toUpperCase()

    const clauses = [`full_name.ilike.%${term}%`]
    if (digits) clauses.push(`phone_normalized.ilike.%${digits}%`)
    if (alnum) clauses.push(`rg_normalized.ilike.%${alnum}%`)
    query = query.or(clauses.join(','))
  }

  return query
}

export function fetchSweepstakesParticipantsCount() {
  return supabase.from('sweepstakes_participants').select('id', { count: 'exact', head: true })
}

export function fetchSweepstakesParticipantById(id) {
  return supabase.from('sweepstakes_participants').select(DETAIL_FIELDS).eq('id', id).maybeSingle()
}

export function updateSweepstakesParticipantStatus(id, status) {
  return supabase.from('sweepstakes_participants').update({ status }).eq('id', id).select().single()
}

// Same care as deleteNews/deleteAd: PostgREST doesn't return an error when
// the DELETE is silently emptied out by RLS (expired session, etc.) — only
// asking for the row back can confirm it actually deleted something.
export async function deleteSweepstakesParticipant(id) {
  const { data, error } = await supabase.from('sweepstakes_participants').delete().eq('id', id).select('id')

  if (error) return { deleted: false, error }

  if (!data || data.length === 0) {
    return {
      deleted: false,
      error: {
        message: 'Nenhum participante foi excluído. Confirme se sua sessão ainda está autenticada como administrador.',
      },
    }
  }

  return { deleted: true, error: null }
}

// Export: only for an already-authenticated admin (RLS itself blocks this
// for any other session) — fetches everything at once, no pagination, to
// generate the whole CSV in the admin's browser. The file never goes
// through a server nor gets hosted at any URL — it's generated and
// downloaded locally (see ManageSweepstakes.jsx).
export function fetchAllSweepstakesParticipantsForExport() {
  return supabase
    .from('sweepstakes_participants')
    .select(DETAIL_FIELDS)
    .order('created_at', { ascending: false })
    .limit(10000)
}
