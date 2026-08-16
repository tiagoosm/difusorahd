import { supabase } from './supabase'

export function fetchCategories() {
  return supabase.from('categories').select('id, name, slug, description').order('name')
}

export function fetchCategoryBySlug(slug) {
  return supabase.from('categories').select('id, name, slug, description').eq('slug', slug).maybeSingle()
}

export function createCategory({ name, slug, description }) {
  return supabase.from('categories').insert({ name, slug, description }).select().single()
}

export function updateCategory(id, { name, slug, description }) {
  return supabase.from('categories').update({ name, slug, description }).eq('id', id).select().single()
}

// Mesmo cuidado de deleteNews/deleteAd: PostgREST não retorna erro quando o
// DELETE é silenciosamente esvaziado pela RLS (ex: sessão expirou) — só
// pedindo a linha de volta dá pra distinguir isso de uma exclusão real.
export async function deleteCategory(id) {
  const { data, error } = await supabase.from('categories').delete().eq('id', id).select()

  if (error) return { deleted: false, error }

  if (!data || data.length === 0) {
    return {
      deleted: false,
      error: { message: 'Nenhuma categoria foi excluída. Confirme se sua sessão ainda está autenticada como administrador.' },
    }
  }

  return { deleted: true, error: null }
}
