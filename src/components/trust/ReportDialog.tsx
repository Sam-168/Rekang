import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Flag, X } from 'lucide-react'
import { reportService } from '../../lib/reports'
import type { ReportReason, ReportTargetType } from '../../types/trust'

const reasons: ReportReason[] = ['Suspicious or misleading', 'Prohibited item', 'Harassment or abuse', 'Spam', 'Other']

export function ReportDialog({ open, onClose, targetType, targetId, targetLabel }: { open: boolean; onClose: () => void; targetType: ReportTargetType; targetId: string; targetLabel: string }) {
  const [reason, setReason] = useState<ReportReason>('Suspicious or misleading')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  if (!open) return null
  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError('')
    try { await reportService.create({ targetType, targetId, targetLabel, reason, details: details.trim() }); setSubmitted(true) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'The report could not be sent.') }
    finally { setSubmitting(false) }
  }
  function close() { setSubmitted(false); setDetails(''); setError(''); onClose() }

  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) close() }}>
    <section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button className="dialog-close" type="button" onClick={close} aria-label="Close report dialog"><X size={20} /></button>
      {submitted ? <div className="report-success"><span><CheckCircle2 size={24} /></span><p className="eyebrow">Report received</p><h2 id="report-title">Thanks for speaking up.</h2><p>Our moderation team will review your report. We won’t tell the reported person who submitted it.</p><button className="button button--primary" type="button" onClick={close}>Done</button></div> : <>
        <div className="report-dialog__heading"><span><Flag size={19} /></span><div><p className="eyebrow">Trust & safety</p><h2 id="report-title">Report this {targetType}.</h2><p>{targetLabel}</p></div></div>
        <form onSubmit={submit}>
          <fieldset><legend>What’s the issue?</legend><div className="report-reasons">{reasons.map((item) => <label key={item}><input type="radio" name="report-reason" checked={reason === item} onChange={() => setReason(item)} /><span>{item}</span></label>)}</div></fieldset>
          <label className="report-details"><span>Add details <small>Optional</small></span><textarea maxLength={500} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share anything that will help our team review this." /><small>{details.length}/500</small></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions"><button className="button button--secondary" type="button" onClick={close}>Cancel</button><button className="button button--primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send report'}</button></div>
        </form>
      </>}
    </section>
  </div>
}
