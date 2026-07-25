import { supabase } from './supabase'

export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signOut() {
  return supabase.auth.signOut()
}

export function fetchProfile(userId) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}
