import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

/**
 * Auth Provider component - wrap your app with this
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} The session data
   */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Send password reset email
   * @param {string} email
   */
  const resetPassword = async (email) => {
    const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })
    if (error) throw error
  }

  /**
   * Update password (after reset)
   * @param {string} newPassword
   */
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth context
 * @returns {{ user: Object|null, loading: boolean, signIn: Function, signOut: Function, isAuthenticated: boolean }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
