import { Link } from 'react-router-dom'
import type { Listing } from '../../types/marketplace'
import { ProductImage } from '../marketplace/ProductImage'

export function OrderLine({ listing, quantity = 1, compact = false }: { listing: Listing; quantity?: number; compact?: boolean }) {
  return (
    <div className={`order-line${compact ? ' order-line--compact' : ''}`}>
      <ProductImage index={listing.imageIndex} imageUrl={listing.imageUrl} alt={listing.title} />
      <div><Link to={`/listings/${listing.id}`}>{listing.title}</Link><span>{listing.seller.name} · {listing.campus}</span><small>Quantity {quantity}</small></div>
      <strong>R {(listing.price * quantity).toLocaleString('en-ZA')}</strong>
    </div>
  )
}
