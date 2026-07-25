import { supabase } from './supabase'

export function fetchCategories() {
  return supabase.from('categories').select('id, name, slug').order('name')
}

export function fetchCategoryBySlug(slug) {
  return supabase.from('categories').select('id, name, slug, description').eq('slug', slug).maybeSingle()
}
