import { ArrowLeft, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ProductImage } from '../../components/marketplace/ProductImage'
import { useMarketplace } from '../../context/useMarketplace'
import { listings } from '../../lib/listings'

export function CartPage() {
  const navigate = useNavigate()
  const { cart, removeFromCart, setQuantity } = useMarketplace()
  const lines = cart.flatMap((line) => {
    const listing = listings.find((item) => item.id === line.listingId)
    return listing ? [{ ...line, listing }] : []
  })
  const total = lines.reduce((sum, line) => sum + line.listing.price * line.quantity, 0)

  return (
    <div className="cart-page">
      <header className="cart-page__header"><button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back</button><span>{lines.length} {lines.length === 1 ? 'item' : 'items'}</span></header>
      <div className="cart-page__layout">
        <section className="cart-items">
          <p className="eyebrow">Your selection</p>
          <h1>Your cart.</h1>
          <p className="page-copy">Confirm your items before checkout.</p>
          {lines.length === 0 ? (
            <EmptyState title="Your cart is empty.">Find something useful from someone nearby.<Link className="button button--primary" to="/home">Browse marketplace</Link></EmptyState>
          ) : lines.map(({ listing, quantity }) => (
            <article className="cart-item" key={listing.id}>
              <ProductImage index={listing.imageIndex} alt={listing.title} />
              <div className="cart-item__copy"><Link to={`/listings/${listing.id}`}>{listing.title}</Link><span>{listing.seller.name} · {listing.campus}</span><strong>R {listing.price.toLocaleString('en-ZA')}</strong><div className="quantity-control"><button type="button" onClick={() => setQuantity(listing.id, quantity - 1)} disabled={quantity === 1} aria-label={`Decrease ${listing.title} quantity`}><Minus size={15} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(listing.id, quantity + 1)} disabled={quantity === 5} aria-label={`Increase ${listing.title} quantity`}><Plus size={15} /></button></div></div>
              <button className="remove-button" type="button" aria-label={`Remove ${listing.title}`} onClick={() => removeFromCart(listing.id)}><Trash2 size={17} /></button>
            </article>
          ))}
        </section>
        {lines.length > 0 && <aside className="cart-summary"><p className="eyebrow">Order summary</p><div><span>Items</span><strong>R {total.toLocaleString('en-ZA')}</strong></div><div><span>Campus collection</span><strong>R 0</strong></div><div className="cart-total"><span>Total</span><strong>R {total.toLocaleString('en-ZA')}</strong></div><Link className="button button--primary button--block" to="/checkout">Checkout</Link><p><ShieldCheck size={15} />Sandbox checkout · no real money</p><Link className="continue-link" to="/home">Continue shopping</Link></aside>}
      </div>
    </div>
  )
}
