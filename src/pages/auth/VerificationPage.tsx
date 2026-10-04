import { Building2, Check, Mail, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthPage, SignUpProgress } from '../../components/auth/AuthPage'
import { Notice } from '../../components/auth/Notice'
import { authService } from '../../lib/auth'

type VerificationState = 'pending' | 'sent' | 'verified'

export function VerificationPage() {
  const [params] = useSearchParams()
  const vendor = params.get('type') === 'vendor'
  const signup = JSON.parse(sessionStorage.getItem('rekang-signup') ?? '{}') as { email?: string }
  const [state, setState] = useState<VerificationState>('pending')
  const [submitting, setSubmitting] = useState(false)

  async function resend() {
    setSubmitting(true)
    await authService.resendVerification()
    setSubmitting(false)
    setState('sent')
  }

  if (state === 'verified') {
    return (
      <AuthPage eyebrow="Account verified" title="You’re ready to go." intro="Your account is verified. You can now buy, sell and post in the community.">
        <div className="verification-mark"><Check size={28} aria-hidden="true" /></div>
        <Link className="button button--primary button--block" to="/home">Browse marketplace</Link>
      </AuthPage>
    )
  }

  return (
    <AuthPage eyebrow="Step 3 of 3" title={vendor ? 'Your account is in review.' : 'Check your email.'} intro={vendor ? 'We’re checking your vendor information. We’ll notify you when the review is complete.' : `We sent a confirmation link to ${signup.email ?? 'your email address'}.`}>
      <SignUpProgress step={3} />
      <div className="verification-mark">{vendor ? <Building2 size={28} aria-hidden="true" /> : <Mail size={28} aria-hidden="true" />}</div>
      {state === 'sent' && <Notice>Verification email resent. Check your inbox and spam folder.</Notice>}
      <div className="detail-list">
        <div className="detail-row"><span>Status</span><strong>{vendor ? 'Pending manual review' : 'Awaiting email confirmation'}</strong></div>
        <div className="detail-row"><span>Access while pending</span><strong>Browse marketplace only</strong></div>
        <div className="detail-row"><span>Restricted until verified</span><strong>Sell, checkout and community posts</strong></div>
      </div>
      <div className="button-stack">
        {vendor ? <Link className="button button--primary" to="/home">Browse marketplace</Link> : <button className="button button--primary" type="button" onClick={resend} disabled={submitting}><RefreshCcw size={17} aria-hidden="true" />{submitting ? 'Resending…' : 'Resend verification email'}</button>}
        <button className="button button--secondary" type="button" onClick={() => setState('verified')}>Preview verified state</button>
        <Link className="button button--secondary" to="/signup">Use a different email</Link>
      </div>
    </AuthPage>
  )
}
