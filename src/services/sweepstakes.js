import { supabase } from './supabase'

// Sem RG/telefone/endereço aqui: a listagem do admin não precisa desses
// dados sensíveis pra exibir a tabela — só a visão de detalhe (fetchById)
// carrega o registro completo. Minimiza o que trafega mesmo pra quem já é
// admin autenticado.
const LIST_FIELDS = 'id, full_name, phone, address_city, status, created_at'
const DETAIL_FIELDS =
  'id, full_name, phone, rg, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zip_code, status, consent_accepted, consent_at, created_at, updated_at'

// Mesmo cuidado de sanitizeSearchTerm em services/news.js: remove caracteres
// com significado especial na sintaxe de filtro do PostgREST (.or()).
function sanitizeSearchTerm(term) {
  return term.replace(/[,()]/g, ' ').trim()
}

// Cadastro público — única forma de escrever nesta tabela (ver RLS/migração:
// não existe policy de INSERT direta, só esta função SECURITY DEFINER).
// Retorna só o id do novo cadastro, nunca os dados enviados de volta.
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

// As mensagens de erro do banco (ver register_sweepstakes_participant) já
// vêm prontas pro usuário final — só protege contra um erro inesperado
// (rede, etc.) vazar texto técnico.
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
  // Datas vêm de <input type="date"> (sem horário) — sem isso, "até
  // 2026-07-26" excluiria cadastros feitos naquele próprio dia depois da
  // meia-noite (mesmo ajuste já usado em fetchAllNewsAdmin).
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

// Mesmo cuidado de deleteNews/deleteAd: PostgREST não retorna erro quando o
// DELETE é silenciosamente esvaziado pela RLS (sessão expirada, etc.) — só
// pedindo a linha de volta dá pra confirmar que realmente excluiu.
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

// Exportação: só para quem já está autenticado como admin (a própria RLS
// barra isso pra qualquer outra sessão) — busca tudo de uma vez, sem
// paginação, pra gerar o CSV inteiro no navegador do admin. O arquivo nunca
// passa por um servidor nem fica hospedado em URL nenhuma — é gerado e
// baixado localmente (ver ManageSweepstakes.jsx).
export function fetchAllSweepstakesParticipantsForExport() {
  return supabase
    .from('sweepstakes_participants')
    .select(DETAIL_FIELDS)
    .order('created_at', { ascending: false })
    .limit(10000)
}
