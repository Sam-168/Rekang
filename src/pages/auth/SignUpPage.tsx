import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthPage, SignUpProgress } from '../../components/auth/AuthPage'
import { FormField } from '../../components/auth/FormField'
import { Notice } from '../../components/auth/Notice'
import { useAuth } from '../../context/useAuth'

export function SignUpPage() {
  const navigate = useNavigate()
  const { stageSignup } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password'))
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    const email = String(data.get('email'))
    setSubmitting(true)
    stageSignup({ fullName: String(data.get('name')), email, password })
    setSubmitting(false)
    navigate('/signup/role')
  }

  return (
    <AuthPage eyebrow="Create account" title="Join your community." intro="Create an account to buy, sell and stay connected.">
      <SignUpProgress step={1} />
      {error && <Notice error>{error}</Notice>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField label="Full name" name="name" autoComplete="name" placeholder="Your full name" required />
        <FormField label="Email" name="email" type="email" autoComplete="email" placeholder="you@university.ac.za" required />
        <FormField label="Password" name="password" type="password" autoComplete="new-password" hint="Use at least 8 characters." required minLength={8} />
        <label className="terms"><input name="terms" type="checkbox" required /><span>I agree to the <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>.</span></label>
        <button className="button button--primary button--block" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Continue'}</button>
      </form>
      <div className="form-footer"><span>Already have an account?</span><Link className="text-link" to="/login">Sign in</Link></div>
    </AuthPage>
  )
}
