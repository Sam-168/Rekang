import { ArrowLeft, Check, ImagePlus, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Notice } from '../../components/auth/Notice'
import { ProductImage } from '../../components/marketplace/ProductImage'
import { listingService } from '../../lib/listings'
import { categories, type Listing, type ListingCategory } from '../../types/marketplace'
import { useAuth } from '../../context/useAuth'

type FormState = { title: string; description: string; price: string; category: ListingCategory; campus: string }
const emptyForm: FormState = { title: '', description: '', price: '', category: 'Books', campus: 'Bellville' }

export function ListingEditorPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const editing = Boolean(listingId)
  const [existing, setExisting] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(editing)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState(false)
  const [savedId, setSavedId] = useState('')

  function selectFiles(selected: FileList | null) {
    const incoming = Array.from(selected ?? [])
    if (incoming.length > 5) {
      setError('Choose no more than 5 images.')
      return
    }
    if (incoming.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Each photo must be a JPG, PNG or WebP smaller than 5 MB.')
      return
    }
    setError('')
    setFiles(incoming)
  }

  useEffect(() => {
    if (!listingId) return
    listingService.findById(listingId).then((item) => {
      if (item) {
        setExisting(item)
        setForm({ title: item.title, description: item.description, price: String(item.price), category: item.category, campus: item.campus })
      }
    }).catch(() => setError('The listing could not be loaded.')).finally(() => setLoading(false))
  }, [listingId])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim() || Number(form.price) <= 0 || (!editing && files.length === 0)) {
      return setError('Add a photo, title, description and a price greater than R 0.')
    }
    setError('')
    setSaving(true)
    try {
      const id = await listingService.save({ title: form.title, description: form.description, price: Number(form.price), category: form.category, campus: form.campus, condition: existing?.condition ?? 'Good condition' }, files, listingId)
      setSavedId(id)
      setPublished(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The listing could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="detail-loading" aria-label="Loading listing editor" aria-busy="true"><span /><i /><i /></div>

  if (!profile?.verified) return <div className="publish-success"><p className="eyebrow">Verification required</p><h1>Verify your account to sell.</h1><p>Confirmed, approved accounts can publish listings and upload product images.</p><Link className="button button--primary" to="/verify">Check verification status</Link></div>

  if (editing && (!existing || existing.seller.id !== user?.id)) {
    return <div className="publish-success"><p className="eyebrow">Listing unavailable</p><h1>We couldn’t find that listing.</h1><p>It may have been removed or you may not have permission to edit it.</p><Link className="button button--primary" to="/home">Back to marketplace</Link></div>
  }

  if (published) {
    return (
      <div className="publish-success">
        <span><Check size={28} /></span>
        <p className="eyebrow">Listing published</p>
        <h1>{editing ? 'Your changes are live.' : 'Your listing is live.'}</h1>
        <p>People on your campus can now find it in the marketplace.</p>
        <Link className="button button--primary" to={`/listings/${savedId}`}>View listing</Link>
      </div>
    )
  }

  return (
    <div className="editor-page narrow-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back</button>
      <p className="eyebrow">{editing ? 'Edit listing' : 'New listing'}</p>
      <h1>{editing ? 'Update your listing.' : 'Sell something useful.'}</h1>
      <p className="page-copy">Clear photos and an honest description help buyers decide.</p>
      {error && <Notice error>{error}</Notice>}
      <form className="listing-form" onSubmit={submit}>
        <label className="upload-field">
          <span>Photos</span>
          <span className="upload-drop"><ImagePlus size={24} /><strong>Add product photos</strong><small>Up to 5 images · JPG, PNG or WebP · 5 MB each</small><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => selectFiles(event.target.files)} /></span>
        </label>
        {(existing || files.length > 0) && <div className="upload-preview">{existing && files.length === 0 && <ProductImage index={existing.imageIndex} imageUrl={existing.imageUrl} alt={existing.title} />}{files.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}<button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles((items) => items.filter((item) => item !== file))}><X size={14} /></button></span>)}</div>}
        <label className="editor-field"><span>Title</span><input value={form.title} maxLength={80} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What are you selling?" required /></label>
        <label className="editor-field"><span>Description</span><textarea value={form.description} maxLength={800} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe its condition and what is included." required /><small>{form.description.length} / 800</small></label>
        <div className="editor-row"><label className="editor-field"><span>Price (R)</span><input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label><label className="editor-field"><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ListingCategory })}>{categories.filter((item) => item !== 'All').map((category) => <option key={category}>{category}</option>)}</select></label></div>
        <label className="editor-field"><span>Campus</span><select value={form.campus} onChange={(event) => setForm({ ...form, campus: event.target.value })}><option>Bellville</option></select></label>
        <button className="button button--primary button--block" type="submit" disabled={saving}>{saving ? 'Saving listing…' : editing ? 'Save changes' : 'Publish listing'}</button>
      </form>
    </div>
  )
}
