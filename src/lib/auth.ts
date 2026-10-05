import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type UserRole = 'student' | 'faculty' | 'vendor' | 'resident'
export type ProfileRole = UserRole | 'admin'

export type AuthProfile = {
  id: string
  role: ProfileRole
  fullName: string
  campus: string
  verified: boolean
  verificationStatus: 'pending' | 'verified' | 'rejected'
  avatarPath: string | null
}

export type PendingSignup = {
  fullName: string
  email: string
  password: string
}

type AuthResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string }

function clientUnavailable(): AuthResult<never> {
  return { ok: false, message: 'Authentication is unavailable right now. Check the project configuration and try again.' }
}

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'Email or password is incorrect. Try again or reset your password.'
  if (normalized.includes('email not confirmed')) return 'Confirm your email before signing in. You can resend the confirmation from the verification page.'
  if (normalized.includes('user already registered') || normalized.includes('already been registered')) return 'An account already uses this email. Sign in or reset your password.'
  if (normalized.includes('password should be')) return 'Use at least 8 characters for your password.'
  if (normalized.includes('rate limit')) return 'Too many requests were made. Wait a few minutes and try again.'
  if (normalized.includes('database error saving new user')) return 'We could not create that account. Check that your university email matches the selected role.'
  return message || 'Something went wrong. Try again.'
}

function authRedirect(path: string) {
  return new URL(path, window.location.origin).toString()
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return clientUnavailable()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? { ok: false, message: friendlyAuthError(error.message) } : { ok: true, data: undefined }
  },

  async signUp(details: PendingSignup, role: UserRole): Promise<AuthResult<{ user: User; email: string }>> {
    if (!supabase) return clientUnavailable()
    const email = details.email.trim().toLowerCase()
    if ((role === 'student' || role === 'faculty') && !isUniversityEmail(email)) {
      return { ok: false, message: 'Students and faculty must use a South African university email ending in .ac.za.' }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: details.password,
      options: {
        emailRedirectTo: authRedirect('/verify'),
        data: { full_name: details.fullName.trim(), role, campus: 'Bellville' },
      },
    })
    if (error) return { ok: false, message: friendlyAuthError(error.message) }
    if (!data.user) return { ok: false, message: 'The account could not be created. Try again.' }
    return { ok: true, data: { user: data.user, email } }
  },

  async requestPasswordReset(email: string): Promise<AuthResult> {
    if (!supabase) return clientUnavailable()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirect('/reset-password') })
    return error ? { ok: false, message: friendlyAuthError(error.message) } : { ok: true, data: undefined }
  },

  async updatePassword(password: string): Promise<AuthResult> {
    if (!supabase) return clientUnavailable()
    const { error } = await supabase.auth.updateUser({ password })
    return error ? { ok: false, message: friendlyAuthError(error.message) } : { ok: true, data: undefined }
  },

  async resendVerification(email: string): Promise<AuthResult> {
    if (!supabase) return clientUnavailable()
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: authRedirect('/verify') } })
    return error ? { ok: false, message: friendlyAuthError(error.message) } : { ok: true, data: undefined }
  },

  async signOut(): Promise<AuthResult> {
    if (!supabase) return clientUnavailable()
    const { error } = await supabase.auth.signOut()
    return error ? { ok: false, message: friendlyAuthError(error.message) } : { ok: true, data: undefined }
  },

  async getProfile(userId: string): Promise<AuthProfile | null> {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, campus, verified, verification_status, avatar_path')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return {
      id: data.id,
      role: data.role as ProfileRole,
      fullName: data.full_name,
      campus: data.campus,
      verified: data.verified,
      verificationStatus: data.verification_status,
      avatarPath: data.avatar_path,
    }
  },
}

export function isUniversityEmail(email: string) {
  return /@[^@]+\.ac\.za$/i.test(email.trim())
}
