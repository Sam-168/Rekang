import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { authService, type AuthProfile, type PendingSignup } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null)
  const [signupEmail, setSignupEmail] = useState('')

  const loadProfile = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setProfile(null)
      return
    }
    try {
      setProfile(await authService.getProfile(nextSession.user.id))
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadProfile(data.session)
      if (active) setLoading(false)
    }).catch(() => { if (active) setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      if (event === 'SIGNED_OUT') setPasswordRecovery(false)
      window.setTimeout(() => { if (active) void loadProfile(nextSession) }, 0)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    passwordRecovery,
    pendingSignup,
    signupEmail,
    stageSignup: setPendingSignup,
    completeSignup: async (role) => {
      if (!pendingSignup) return { ok: false, message: 'Your sign-up details expired. Return to the previous step and try again.' }
      const result = await authService.signUp(pendingSignup, role)
      if (!result.ok) return result
      setSignupEmail(result.data.email)
      setPendingSignup(null)
      return { ok: true }
    },
    refreshProfile: async () => { await loadProfile(session) },
    signOut: async () => {
      const result = await authService.signOut()
      if (result.ok) {
        setSession(null)
        setProfile(null)
      }
      return result
    },
  }), [loading, loadProfile, passwordRecovery, pendingSignup, profile, session, signupEmail])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
