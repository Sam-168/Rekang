import { Check } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthPage } from '../../components/auth/AuthPage'
import { FormField } from '../../components/auth/FormField'
import { authService } from '../../lib/auth'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    await authService.requestPasswordReset()
    setSubmitting(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthPage eyebrow="Password reset" title="Check your inbox." intro="If an account matches that email, you’ll receive a password reset link.">
        <div className="verification-mark"><Check size={28} aria-hidden="true" /></div>
        <Link className="button button--primary button--block" to="/login">Back to sign in</Link>
      </AuthPage>
    )
  }

  return (
    <AuthPage eyebrow="Password reset" title="Reset your password." intro="Enter the email you use for Rekang.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@university.ac.za" required />
        <button className="button button--primary button--block" type="submit" disabled={submitting}>{submitting ? 'Sending link…' : 'Send reset link'}</button>
      </form>
      <div className="form-footer"><span>Remembered your password?</span><Link className="text-link" to="/login">Back to sign in</Link></div>
    </AuthPage>
  )
}
