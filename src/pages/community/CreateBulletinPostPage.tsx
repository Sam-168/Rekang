import { useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, Check, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { bulletinService } from '../../lib/community'
import { bulletinCategories, type BulletinCategory } from '../../types/community'

type Draft = { title: string; category: BulletinCategory; body: string; eventDate: string; eventTime: string; location: string }
const initialDraft: Draft = { title: '', category: 'Events', body: '', eventDate: '', eventTime: '', location: '' }
const displayDate = (date: string) => new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`))

export function CreateBulletinPostPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(initialDraft)
  const [previewing, setPreviewing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const hasEvent = draft.category !== 'Announcements'

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })) }
  function submit(event: FormEvent) { event.preventDefault(); setPreviewing(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function publish() {
    setPublishing(true)
    const post = await bulletinService.create({ title: draft.title.trim(), category: draft.category, body: draft.body.trim(), eventDate: hasEvent ? draft.eventDate : undefined, eventTime: hasEvent ? draft.eventTime : undefined, location: hasEvent ? draft.location.trim() : undefined })
    navigate(`/community/${post.id}`, { replace: true })
  }

  if (previewing) return (
    <div className="editor-page community-editor community-preview">
      <button className="back-link back-link--button" type="button" onClick={() => setPreviewing(false)}><ArrowLeft size={17} /> Edit post</button>
      <p className="eyebrow">Preview</p><h1>{draft.title}</h1><span className="bulletin-category">{draft.category}</span>
      {hasEvent && <section className="event-panel"><div><CalendarDays size={19} /><span><small>When</small><strong>{displayDate(draft.eventDate)} at {draft.eventTime}</strong></span></div><div><MapPin size={19} /><span><small>Where</small><strong>{draft.location}</strong></span></div></section>}
      <p className="community-preview__body">{draft.body}</p>
      <div className="community-editor__actions"><button className="button button--secondary" type="button" onClick={() => setPreviewing(false)}>Keep editing</button><button className="button button--primary" type="button" disabled={publishing} onClick={publish}><Check size={17} /> {publishing ? 'Publishing…' : 'Publish post'}</button></div>
    </div>
  )

  return (
    <div className="editor-page community-editor">
      <Link className="back-link" to="/community"><ArrowLeft size={17} /> Community</Link>
      <p className="eyebrow">New bulletin post</p><h1>Share with campus.</h1><p className="editor-intro">Keep it clear, useful and relevant to your university community.</p>
      <form onSubmit={submit} className="community-form">
        <label><span>Post title</span><input required maxLength={80} value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="What should people know?" /><small>{draft.title.length}/80</small></label>
        <fieldset><legend>Category</legend><div className="category-choice">{bulletinCategories.slice(1).map((category) => <label key={category}><input type="radio" name="category" value={category} checked={draft.category === category} onChange={() => update('category', category as BulletinCategory)} /><span>{category}</span></label>)}</div></fieldset>
        <label><span>Details</span><textarea required maxLength={800} value={draft.body} onChange={(event) => update('body', event.target.value)} placeholder="Add the details people need to take part." /><small>{draft.body.length}/800</small></label>
        {hasEvent && <div className="event-fields"><label><span>Date</span><input required type="date" value={draft.eventDate} onChange={(event) => update('eventDate', event.target.value)} /></label><label><span>Time</span><input required type="time" value={draft.eventTime} onChange={(event) => update('eventTime', event.target.value)} /></label><label className="event-fields__location"><span>Location</span><input required value={draft.location} onChange={(event) => update('location', event.target.value)} placeholder="Building or meeting point" /></label></div>}
        <button className="button button--primary" type="submit">Preview post</button>
      </form>
    </div>
  )
}
