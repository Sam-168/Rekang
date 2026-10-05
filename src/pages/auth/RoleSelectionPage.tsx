import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthPage, SignUpProgress } from '../../components/auth/AuthPage'
import type { UserRole } from '../../lib/auth'
import { Notice } from '../../components/auth/Notice'
import { useAuth } from '../../context/useAuth'

const roles: Array<{ value: UserRole; label: string; description: string }> = [
  { value: 'student', label: 'Student', description: 'Buy, sell and join campus activities. University email verification required.' },
  { value: 'faculty', label: 'Faculty', description: 'Trade locally and share announcements. University email verification required.' },
  { value: 'vendor', label: 'Local vendor', description: 'Reach the campus community. Your business details will be reviewed.' },
  { value: 'resident', label: 'Resident', description: 'Trade with nearby members and take part in the community.' },
]

export function RoleSelectionPage() {
  const navigate = useNavigate()
  const { pendingSignup, completeSignup } = useAuth()
  const [role, setRole] = useState<UserRole>('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!pendingSignup) return <Navigate to="/signup" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await completeSignup(role)
    setSubmitting(false)
    if (!result.ok) return setError(result.message)
    navigate(`/verify?type=${role === 'vendor' ? 'vendor' : 'email'}`)
  }

  return (
    <AuthPage eyebrow="Step 2 of 3" title="How will you use Rekang?" intro="Choose the role that best fits you. You can ask support to update it later." wide>
      <SignUpProgress step={2} />
      {error && <Notice error>{error}</Notice>}
      <form onSubmit={handleSubmit}>
        <fieldset className="role-list">
          <legend className="sr-only">Choose your account role</legend>
          {roles.map((item) => (
            <label className="role-option" key={item.value}>
              <input type="radio" name="role" value={item.value} checked={role === item.value} onChange={() => setRole(item.value)} />
              <span><strong>{item.label}</strong><span>{item.description}</span></span>
            </label>
          ))}
        </fieldset>
        <button className="button button--primary button--block" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
      </form>
      <div className="form-footer"><span>Need to change your details?</span><button className="text-link text-link--button" type="button" onClick={() => navigate('/signup')}>Back to account</button></div>
    </AuthPage>
  )
}
