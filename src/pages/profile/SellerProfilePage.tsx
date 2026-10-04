import { BadgeCheck, Flag, MapPin, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ListingCard } from '../../components/marketplace/ListingCard'
import { ReportDialog } from '../../components/trust/ReportDialog'
import { listings } from '../../lib/listings'
import { orderService } from '../../lib/orders'
import type { Review } from '../../types/marketplace'

export function SellerProfilePage() {
  const { sellerId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'reviews' ? 'reviews' : 'listings'
  const sellerListings = listings.filter((listing) => listing.seller.id === sellerId)
  const seller = sellerListings[0]?.seller
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [reporting, setReporting] = useState(false)
  useEffect(() => { orderService.reviewsForSeller(sellerId).then(setReviews) }, [sellerId])

  if (!seller) return <EmptyState title="Seller not found.">This profile may no longer be available.</EmptyState>

  return (
    <div className="seller-page">
      <header className="seller-profile-head">
        <div className="seller-profile-avatar">{seller.initials}</div>
        <div><p className="eyebrow">Seller profile</p><h1>{seller.name}.</h1><p><MapPin size={14} />Bellville campus · Student</p></div>
        <span className="verified-label"><BadgeCheck size={16} />University email verified</span>
      </header>
      <div className="seller-stats"><div><strong>{seller.rating}</strong><span><Star size={14} fill="currentColor" />Average rating</span></div><div><strong>{seller.reviews}</strong><span>Verified reviews</span></div><div><strong>{sellerListings.length}</strong><span>Active listings</span></div></div>
      <div className="profile-tabs"><button className={tab === 'listings' ? 'is-active' : ''} type="button" onClick={() => setParams({ tab: 'listings' })}>Listings</button><button className={tab === 'reviews' ? 'is-active' : ''} type="button" onClick={() => setParams({ tab: 'reviews' })}>Reviews</button></div>
      {tab === 'listings' ? sellerListings.length > 0 ? <div className="listing-grid profile-listings">{sellerListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <EmptyState title="No active listings.">New listings from this seller will appear here.</EmptyState> : reviews === null ? <div className="order-list-loading" aria-busy="true"><span /><span /></div> : reviews.length > 0 ? <div className="review-list">{reviews.map((review) => <article key={review.id}><div><strong>{review.reviewerName}</strong><span><Star size={13} fill="currentColor" />{review.rating} / 5</span></div><p>{review.comment}</p><small>Verified purchase · {new Date(review.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}</small></article>)}</div> : <EmptyState title="No reviews yet.">Reviews appear after completed purchases.</EmptyState>}
      <button className="report-link" type="button" onClick={() => setReporting(true)}><Flag size={15} />Report this profile</button>
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="profile" targetId={seller.id} targetLabel={seller.name} />
    </div>
  )
}
