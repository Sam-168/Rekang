import { Building2, Check, Mail, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthPage, SignUpProgress } from '../../components/auth/AuthPage'
import { Notice } from '../../components/auth/Notice'
import { useAuth } from '../../context/useAuth'
import { authService } from '../../lib/auth'

export function VerificationPage() {
  const [params] = useSearchParams()
  const { user, profile, loading, signupEmail, refreshProfile } = useAuth()
  const vendor = profile?.role === 'vendor' || (!profile && params.get('type') === 'vendor')
  const email = user?.email ?? signupEmail
  const emailConfirmed = Boolean(user?.email_confirmed_at)
  const verified = Boolean(profile?.verified)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function resend() {
    if (!email) return setError('Return to sign up and enter your email again.')
    setError('')
    setSubmitting(true)
    const result = await authService.resendVerification(email)
    setSubmitting(false)
    if (!result.ok) return setError(result.message)
    setSent(true)
  }

  if (loading) return <AuthPage eyebrow="Account verification" title="Checking your account." intro="This will only take a moment." />

  if (verified) {
    return (
      <AuthPage eyebrow="Account verified" title="You’re ready to go." intro="Your email and account are verified. You can now buy, sell and post in the community.">
        <div className="verification-mark"><Check size={28} aria-hidden="true" /></div>
        <Link className="button button--primary button--block" to="/home">Browse marketplace</Link>
      </AuthPage>
    )
  }

  if (emailConfirmed && vendor) {
    return (
      <AuthPage eyebrow="Vendor verification" title="Your account is in review." intro="Your email is confirmed. We’ll notify you when your vendor review is complete.">
        <SignUpProgress step={3} />
        <div className="verification-mark"><Building2 size={28} aria-hidden="true" /></div>
        <div className="detail-list">
          <div className="detail-row"><span>Email</span><strong>Confirmed</strong></div>
          <div className="detail-row"><span>Vendor status</span><strong>{profile?.verificationStatus ?? 'pending'}</strong></div>
          <div className="detail-row"><span>Access while pending</span><strong>Browse marketplace only</strong></div>
        </div>
        <div className="button-stack"><Link className="button button--primary" to="/home">Browse marketplace</Link><button className="button button--secondary" type="button" onClick={() => void refreshProfile()}>Refresh review status</button></div>
      </AuthPage>
    )
  }

  return (
    <AuthPage eyebrow="Step 3 of 3" title={emailConfirmed ? 'Finishing verification.' : 'Check your email.'} intro={emailConfirmed ? 'Your email is confirmed. Refresh once while we finish setting up your profile.' : `We sent a confirmation link to ${email || 'your email address'}.`}>
      <SignUpProgress step={3} />
      <div className="verification-mark"><Mail size={28} aria-hidden="true" /></div>
      {sent && <Notice>Verification email resent. Check your inbox and spam folder.</Notice>}
      {error && <Notice error>{error}</Notice>}
      <div className="detail-list">
        <div className="detail-row"><span>Status</span><strong>{emailConfirmed ? 'Email confirmed' : 'Awaiting email confirmation'}</strong></div>
        <div className="detail-row"><span>Restricted until verified</span><strong>Sell, checkout and community posts</strong></div>
      </div>
      <div className="button-stack">
        {emailConfirmed ? <button className="button button--primary" type="button" onClick={() => void refreshProfile()}><RefreshCcw size={17} />Refresh account</button> : <button className="button button--primary" type="button" onClick={resend} disabled={submitting}><RefreshCcw size={17} aria-hidden="true" />{submitting ? 'Resending…' : 'Resend verification email'}</button>}
        <Link className="button button--secondary" to={emailConfirmed ? '/home' : '/signup'}>{emailConfirmed ? 'Browse marketplace' : 'Use a different email'}</Link>
      </div>
    </AuthPage>
  )
}
