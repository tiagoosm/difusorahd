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

// Same care as deleteNews/deleteAd: PostgREST doesn't return an error when
// the DELETE is silently emptied out by RLS (e.g. session expired) — only
// asking for the row back can tell this apart from a real deletion.
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
