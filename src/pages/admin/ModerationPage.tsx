import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, CircleAlert, Eye, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { reportService } from '../../lib/reports'
import type { Report, ReportStatus } from '../../types/trust'
import { useAuth } from '../../context/useAuth'

type Filter = 'all' | ReportStatus
const filters: { value: Filter; label: string }[] = [{ value: 'all', label: 'All reports' }, { value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }]

export function ModerationPage() {
  const { profile } = useAuth()
  if (profile?.role !== 'admin' || !profile.verified) return <AdminAccessDenied />
  return <ModerationDashboard />
}

function AdminAccessDenied() {
  return <div className="admin-denied"><span><ShieldCheck size={25} /></span><p className="eyebrow">Admin access</p><h1>Restricted area.</h1><p>This dashboard requires a verified administrator account.</p><Link className="text-link" to="/home">Return to marketplace</Link></div>
}

function ModerationDashboard() {
  const [reports, setReports] = useState<Report[] | null>(null)
  const [filter, setFilter] = useState<Filter>('open')
  const [selected, setSelected] = useState<Report | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { reportService.list().then(setReports) }, [])
  const visible = useMemo(() => reports?.filter((report) => filter === 'all' || report.status === filter) ?? [], [filter, reports])
  const openCount = reports?.filter((report) => report.status === 'open').length ?? 0

  async function decide(status: 'resolved' | 'dismissed') {
    if (!selected) return
    setSaving(true)
    const updated = await reportService.updateStatus(selected.id, status, note.trim() || (status === 'resolved' ? 'Action taken after review.' : 'No policy violation found.'))
    setReports((current) => current?.map((item) => item.id === updated.id ? updated : item) ?? null)
    setSelected(updated); setNote(''); setSaving(false)
  }

  return <div className="moderation-page">
    <header className="moderation-heading"><div><p className="eyebrow">Trust & safety</p><h1>Moderation queue.</h1><p>Review community reports and record a clear outcome.</p></div><div className="moderation-count"><strong>{openCount}</strong><span>Open reports</span></div></header>
    <nav className="moderation-filters" aria-label="Filter reports">{filters.map((item) => <button key={item.value} className={filter === item.value ? 'is-active' : ''} type="button" onClick={() => setFilter(item.value)}>{item.label}{item.value === 'open' && <span>{openCount}</span>}</button>)}</nav>
    <div className="moderation-layout">
      <section className="report-queue" aria-live="polite">{reports === null ? <div className="queue-loading"><i /><i /><i /></div> : visible.length ? visible.map((report) => <button key={report.id} type="button" className={`queue-row${selected?.id === report.id ? ' is-selected' : ''}`} onClick={() => { setSelected(report); setNote('') }}><span className={`status-dot status-dot--${report.status}`} /><span><small>{report.id} · {report.targetType}</small><strong>{report.targetLabel}</strong><span>{report.reason}</span><time>{new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(report.createdAt))}</time></span><ChevronRight size={17} /></button>) : <div className="queue-empty"><Check size={23} /><strong>No {filter === 'all' ? '' : filter} reports.</strong><span>The queue is clear.</span></div>}</section>
      <aside className={`report-inspector${selected ? ' is-open' : ''}`}>{selected ? <><div className="inspector-heading"><span className={`report-status report-status--${selected.status}`}>{selected.status}</span><small>{selected.id}</small><h2>{selected.targetLabel}</h2><p>{selected.targetType} · Reported by {selected.reporterName}</p></div><dl><div><dt>Reason</dt><dd>{selected.reason}</dd></div><div><dt>Report details</dt><dd>{selected.details}</dd></div>{selected.resolutionNote && <div><dt>Resolution note</dt><dd>{selected.resolutionNote}</dd></div>}</dl>{selected.status === 'open' ? <div className="moderation-decision"><label><span>Internal note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record what you checked or the action taken." /></label><div><button className="button button--secondary" disabled={saving} type="button" onClick={() => decide('dismissed')}><X size={16} /> Dismiss</button><button className="button button--primary" disabled={saving} type="button" onClick={() => decide('resolved')}><Check size={16} /> Resolve</button></div></div> : <div className="decision-complete"><Check size={18} /> Decision recorded</div>}<button className="inspector-close" type="button" onClick={() => setSelected(null)}>Close details</button></> : <div className="inspector-placeholder"><Eye size={24} /><strong>Select a report</strong><span>Details and moderation actions will appear here.</span></div>}</aside>
    </div>
    <footer className="admin-footnote"><CircleAlert size={16} /><span>Administrator access is verified from your Supabase profile and enforced again by row-level security.</span></footer>
  </div>
}
