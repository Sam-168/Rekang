import { BadgeCheck, Flag, MapPin, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ListingCard } from '../../components/marketplace/ListingCard'
import { ReportDialog } from '../../components/trust/ReportDialog'
import { listingService, type SellerProfileData } from '../../lib/listings'

const roleLabels = { student: 'Student', faculty: 'Faculty', vendor: 'Local vendor', resident: 'Resident', admin: 'Administrator' }

export function SellerProfilePage() {
  const { sellerId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'reviews' ? 'reviews' : 'listings'
  const [data, setData] = useState<SellerProfileData | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    let active = true
    const timeout = window.setTimeout(() => { if (active) { setFailed(false); setData(undefined) } }, 0)
    listingService.findSeller(sellerId)
      .then((result) => { if (active) setData(result) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false; window.clearTimeout(timeout) }
  }, [sellerId])

  if (data === undefined && !failed) return <div className="detail-loading" aria-busy="true"><span /><i /><i /></div>
  if (failed) return <EmptyState title="Couldn’t load this seller.">Check your connection and try again.</EmptyState>
  if (!data) return <EmptyState title="Seller not found.">This profile may no longer be available.</EmptyState>
  const { seller, listings, reviews } = data

  return (
    <div className="seller-page">
      <header className="seller-profile-head">
        <div className="seller-profile-avatar" style={seller.avatarUrl ? { backgroundImage: `url(${seller.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : undefined}>{seller.initials}</div>
        <div><p className="eyebrow">Seller profile</p><h1>{seller.name}.</h1><p><MapPin size={14} />{seller.campus} campus · {roleLabels[seller.role]}</p></div>
        {seller.verified && <span className="verified-label"><BadgeCheck size={16} />Verified account</span>}
      </header>
      <div className="seller-stats"><div><strong>{seller.reviews ? seller.rating : '—'}</strong><span><Star size={14} fill="currentColor" />Average rating</span></div><div><strong>{seller.reviews}</strong><span>Verified reviews</span></div><div><strong>{listings.length}</strong><span>Active listings</span></div></div>
      <div className="profile-tabs"><button className={tab === 'listings' ? 'is-active' : ''} type="button" onClick={() => setParams({ tab: 'listings' })}>Listings</button><button className={tab === 'reviews' ? 'is-active' : ''} type="button" onClick={() => setParams({ tab: 'reviews' })}>Reviews</button></div>
      {tab === 'listings' ? listings.length > 0 ? <div className="listing-grid profile-listings">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <EmptyState title="No active listings.">New listings from this seller will appear here.</EmptyState> : reviews.length > 0 ? <div className="review-list">{reviews.map((review) => <article key={review.id}><div><strong>{review.reviewerName}</strong><span><Star size={13} fill="currentColor" />{review.rating} / 5</span></div><p>{review.comment}</p><small>Verified purchase · {new Date(review.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}</small></article>)}</div> : <EmptyState title="No reviews yet.">Reviews appear after completed purchases.</EmptyState>}
      <button className="report-link" type="button" onClick={() => setReporting(true)}><Flag size={15} />Report this profile</button>
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="profile" targetId={seller.id} targetLabel={seller.name} />
    </div>
  )
}
