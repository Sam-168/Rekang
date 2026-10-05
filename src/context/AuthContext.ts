import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthProfile, PendingSignup, UserRole } from '../lib/auth'

type ActionResult = { ok: true } | { ok: false; message: string }

export type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: AuthProfile | null
  loading: boolean
  passwordRecovery: boolean
  pendingSignup: PendingSignup | null
  signupEmail: string
  stageSignup: (details: PendingSignup) => void
  completeSignup: (role: UserRole) => Promise<ActionResult>
  refreshProfile: () => Promise<void>
  signOut: () => Promise<ActionResult>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
