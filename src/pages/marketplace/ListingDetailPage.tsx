import { ArrowLeft, BadgeCheck, Flag, MapPin, ShoppingBag, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ProductImage } from '../../components/marketplace/ProductImage'
import { ReportDialog } from '../../components/trust/ReportDialog'
import { Notice } from '../../components/auth/Notice'
import { useMarketplace } from '../../context/useMarketplace'
import { listingService } from '../../lib/listings'
import type { Listing } from '../../types/marketplace'

export function ListingDetailPage() {
  const { listingId = '' } = useParams()
  const navigate = useNavigate()
  const { addToCart, cart, cartError } = useMarketplace()
  const [listing, setListing] = useState<Listing | null | undefined>(undefined)
  const [added, setAdded] = useState(false)
  const [reporting, setReporting] = useState(false)

  useEffect(() => { listingService.findById(listingId).then(setListing).catch(() => setListing(null)) }, [listingId])
  const inCart = cart.some((line) => line.listingId === listingId)

  if (listing === undefined) return <div className="detail-loading" aria-label="Loading listing" aria-busy="true"><span /><i /><i /></div>
  if (!listing) return <EmptyState title="This listing is unavailable.">It may have been sold or removed.<Link className="button button--primary" to="/home">Back to marketplace</Link></EmptyState>

  async function add() {
    try {
      await addToCart(listingId)
      setAdded(true)
      return true
    } catch {
      setAdded(false)
      return false
    }
  }

  return (
    <article className="listing-detail">
      <button className="floating-back" type="button" aria-label="Go back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
      <ProductImage index={listing.imageIndex} imageUrl={listing.imageUrl} className="listing-detail__image" alt={listing.title} />
      <div className="listing-detail__content">
        {added && <div className="inline-success" role="status">Added to your cart. <Link to="/cart">View cart</Link></div>}
        {cartError && <Notice error>{cartError}</Notice>}
        <div className="listing-detail__meta"><span>{listing.category}</span><span><MapPin size={13} />{listing.campus}</span><span>{listing.postedLabel}</span></div>
        <h1>{listing.title}</h1>
        <div className="listing-detail__price"><strong>R {listing.price.toLocaleString('en-ZA')}</strong><span>Available</span></div>
        <dl className="listing-facts"><div><dt>Condition</dt><dd>{listing.condition}</dd></div><div><dt>Collection</dt><dd>On campus</dd></div></dl>
        <section className="detail-section"><h2>About this listing</h2><p>{listing.description}</p></section>
        <section className="seller-card">
          <div className="seller-avatar">{listing.seller.initials}</div>
          <div><h2>{listing.seller.name}{listing.seller.verified && <BadgeCheck size={16} aria-label="Verified seller" />}</h2><p><Star size={14} fill="currentColor" />{listing.seller.rating} · {listing.seller.reviews} reviews</p></div>
          <Link to={`/sellers/${listing.seller.id}`}>View seller</Link>
        </section>
        <button className="report-link" type="button" onClick={() => setReporting(true)}><Flag size={15} />Report this listing</button>
      </div>
      <div className="purchase-bar">
        <button className="button button--secondary" type="button" onClick={add} disabled={inCart}><ShoppingBag size={17} />{inCart ? 'In cart' : 'Add to cart'}</button>
        <button className="button button--primary" type="button" onClick={async () => { if (await add()) navigate('/cart') }}>Buy now</button>
      </div>
      <ReportDialog open={reporting} onClose={() => setReporting(false)} targetType="listing" targetId={listing.id} targetLabel={listing.title} />
    </article>
  )
}
