import { Check } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthPage } from '../../components/auth/AuthPage'
import { FormField } from '../../components/auth/FormField'
import { Notice } from '../../components/auth/Notice'
import { authService } from '../../lib/auth'
import { useAuth } from '../../context/useAuth'

export function ResetPasswordPage() {
  const { session, loading } = useAuth()
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password'))
    const confirmation = String(data.get('confirmation'))
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    if (password !== confirmation) return setError('The passwords don’t match. Check both fields.')
    setError('')
    setSubmitting(true)
    const result = await authService.updatePassword(password)
    setSubmitting(false)
    if (!result.ok) return setError(result.message)
    setUpdated(true)
  }

  if (loading) return <AuthPage eyebrow="Password reset" title="Checking your reset link." intro="This will only take a moment." />
  if (!session) return <AuthPage eyebrow="Password reset" title="Open a valid reset link." intro="Request a new password-reset email, then open the link from that message."><Notice error>This reset link is missing, invalid or expired.</Notice><Link className="button button--primary button--block" to="/forgot-password">Request a new link</Link></AuthPage>

  if (updated) {
    return (
      <AuthPage eyebrow="Password reset" title="Password updated." intro="Use your new password to sign in.">
        <div className="verification-mark"><Check size={28} aria-hidden="true" /></div>
        <Link className="button button--primary button--block" to="/login">Sign in</Link>
      </AuthPage>
    )
  }

  return (
    <AuthPage eyebrow="Password reset" title="Choose a new password." intro="Use at least 8 characters and avoid a password you use elsewhere.">
      {error && <Notice error>{error}</Notice>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField label="New password" name="password" type="password" autoComplete="new-password" required />
        <FormField label="Confirm password" name="confirmation" type="password" autoComplete="new-password" required />
        <button className="button button--primary button--block" type="submit" disabled={submitting}>{submitting ? 'Updating password…' : 'Update password'}</button>
      </form>
    </AuthPage>
  )
}
