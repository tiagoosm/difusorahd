import { createContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { fetchProfile } from '../services/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function syncSession(currentUser) {
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        return
      }

      const { data } = await fetchProfile(currentUser.id)
      if (isMounted) setProfile(data ?? null)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSession(session?.user ?? null)
      if (isMounted) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncSession(session?.user ?? null)
      if (isMounted) setLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function refreshProfile() {
    if (!user) return
    const { data } = await fetchProfile(user.id)
    setProfile(data ?? null)
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
