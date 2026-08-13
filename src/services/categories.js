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

export function deleteCategory(id) {
  return supabase.from('categories').delete().eq('id', id)
}
