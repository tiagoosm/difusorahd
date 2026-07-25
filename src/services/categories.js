import { supabase } from './supabase'

export function fetchCategories() {
  return supabase.from('categories').select('id, name, slug').order('name')
}
