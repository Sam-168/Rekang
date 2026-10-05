import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Listing } from '../../types/marketplace'
import { ProductImage } from './ProductImage'

export function ListingCard({ listing, layout = 'grid' }: { listing: Listing; layout?: 'grid' | 'row' }) {
  return (
    <Link className={`listing-card listing-card--${layout}`} to={`/listings/${listing.id}`} aria-label={`View ${listing.title}, R ${listing.price}`}>
      <ProductImage index={listing.imageIndex} imageUrl={listing.imageUrl} alt={listing.title} />
      <span className="listing-card__copy">
        <strong>{listing.title}</strong>
        <span className="listing-card__price">R {listing.price.toLocaleString('en-ZA')}</span>
        <span className="listing-card__meta">{listing.category}<span aria-hidden="true">·</span><MapPin size={12} aria-hidden="true" />{listing.campus}</span>
      </span>
    </Link>
  )
}
