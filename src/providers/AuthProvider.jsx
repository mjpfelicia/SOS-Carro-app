import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { isAdmin } from "../services/storage"
import { getCurrentSessionUser, syncLegacySessionUser } from "../services/authService"
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"

const AuthContext = createContext({
  user: null,
  isAdminUser: false,
  loading: true,
  refreshUser: async () => null
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refreshUser() {
    try {
      const usuario = await getCurrentSessionUser()
      setUser(usuario)
      syncLegacySessionUser(usuario)
      return usuario
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      refreshUser()
      return undefined
    }

    refreshUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAdminUser: isAdmin(user),
      loading,
      refreshUser
    }),
    [loading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

