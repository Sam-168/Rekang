import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthPage } from '../../components/auth/AuthPage'
import { FormField } from '../../components/auth/FormField'
import { Notice } from '../../components/auth/Notice'
import { authService } from '../../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const data = new FormData(event.currentTarget)
    const result = await authService.signIn(String(data.get('email')), String(data.get('password')))
    setSubmitting(false)
    if (!result.ok) return setError(result.message)
    const destination = (location.state as { from?: string } | null)?.from
    navigate(destination?.startsWith('/') ? destination : '/home', { replace: true })
  }

  return (
    <AuthPage eyebrow="Rekang account" title="Good to see you." intro="Sign in to your campus community.">
      {error && <Notice error>{error}</Notice>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@university.ac.za" required />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" required />
        <div className="form-row"><Link className="text-link" to="/forgot-password">Forgot password?</Link></div>
        <button className="button button--primary button--block" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="form-footer"><span>New to Rekang?</span><Link className="text-link" to="/signup">Create account</Link></div>
    </AuthPage>
  )
}
