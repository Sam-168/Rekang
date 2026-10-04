export type UserRole = 'student' | 'faculty' | 'vendor' | 'resident'

type AuthResult = { ok: true } | { ok: false; message: string }

const wait = (milliseconds = 450) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    await wait()
    if (email.toLowerCase().includes('invalid') || password === 'wrongpass') {
      return { ok: false, message: 'Email or password is incorrect. Try again or reset your password.' }
    }
    return { ok: true }
  },

  async createAccount(email: string): Promise<AuthResult> {
    await wait()
    if (email.toLowerCase().includes('existing')) {
      return { ok: false, message: 'An account already uses this email. Sign in or reset your password.' }
    }
    return { ok: true }
  },

  async requestPasswordReset(): Promise<AuthResult> {
    await wait()
    return { ok: true }
  },

  async updatePassword(): Promise<AuthResult> {
    await wait()
    return { ok: true }
  },

  async resendVerification(): Promise<AuthResult> {
    await wait()
    return { ok: true }
  },
}

export function isUniversityEmail(email: string) {
  return /@[^@]+\.ac\.za$/i.test(email)
}
