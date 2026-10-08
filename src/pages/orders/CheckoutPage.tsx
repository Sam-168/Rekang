import { ArrowLeft, CreditCard, Landmark, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Notice } from '../../components/auth/Notice'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { OrderLine } from '../../components/orders/OrderLine'
import { useMarketplace } from '../../context/useMarketplace'
import { orderService, payFastCheckoutEnabled, submitPaymentRedirect } from '../../lib/orders'
import type { PaymentGateway } from '../../types/marketplace'
import { useAuth } from '../../context/useAuth'

export function CheckoutPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { cart, cartListings, reloadCart } = useMarketplace()
  const { profile } = useAuth()
  const [gateway, setGateway] = useState<PaymentGateway>('payfast')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(params.get('state') === 'failed' ? 'Payment wasn’t completed. No payment was taken. Try again or choose another method.' : '')
  const lines = cart.flatMap((line) => {
    const listing = cartListings[line.listingId]
    return listing ? [{ ...line, listing }] : []
  })
  const total = lines.reduce((sum, line) => sum + line.listing.price * line.quantity, 0)
  const sellerCount = new Set(lines.map((line) => line.listing.seller.id)).size

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setProcessing(true)
    try {
      const data = new FormData(event.currentTarget)
      const result = await orderService.create({
        gateway,
        collectionName: String(data.get('collectionName')),
        collectionPhone: String(data.get('collectionPhone')),
        collectionNote: String(data.get('collectionNote')),
      })
      await reloadCart()
      if (result.kind === 'redirect') {
        submitPaymentRedirect(result.payment)
        return
      }
      navigate(`/orders/${result.order.id}/confirmation`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Payment could not be started.')
      setProcessing(false)
    }
  }

  if (lines.length === 0) {
    return <div className="task-page"><EmptyState title="Your cart is empty.">Add an item before starting checkout.<Link className="button button--primary" to="/home">Browse marketplace</Link></EmptyState></div>
  }

  if (!profile?.verified) return <div className="task-page"><EmptyState title="Verify your account first.">Only verified members can place orders.<Link className="button button--primary" to="/verify">Check verification status</Link></EmptyState></div>

  return (
    <div className="task-page">
      <header className="task-header"><button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back to cart</button><span>{payFastCheckoutEnabled ? 'Secure PayFast checkout' : 'Secure sandbox checkout'}</span></header>
      <form className="checkout-layout" onSubmit={pay}>
        <section>
          <p className="eyebrow">Checkout</p><h1>Complete your order.</h1><p className="page-copy">Review your item and select a payment method.</p>
          <Notice><strong>Sandbox payment</strong><br />No real money will be charged.</Notice>
          {sellerCount > 1 && <Notice error>Checkout currently supports one seller per order. Remove items from other sellers and place separate orders.</Notice>}
          {error && <Notice error>{error}</Notice>}
          <h2>Collection</h2><div className="collection-option"><MapMarker /><div><strong>Bellville campus library</strong><span>Arrange a collection time with the seller after payment.</span></div></div>
          <div className="checkout-collection-fields"><label className="editor-field"><span>Collector name</span><input name="collectionName" defaultValue={profile.fullName} minLength={2} required /></label><label className="editor-field"><span>Phone number</span><input name="collectionPhone" type="tel" autoComplete="tel" placeholder="082 123 4567" required /></label><label className="editor-field"><span>Collection note <small>Optional</small></span><textarea name="collectionNote" maxLength={500} placeholder="Preferred collection time or access details" /></label></div>
          <h2>Payment method</h2>
          <div className="payment-options">
            <label><input type="radio" name="gateway" checked={gateway === 'payfast'} onChange={() => setGateway('payfast')} /><CreditCard size={20} /><span><strong>PayFast</strong><small>{payFastCheckoutEnabled ? 'Redirect to secure checkout' : 'Secure test checkout'}</small></span></label>
            <label><input type="radio" name="gateway" checked={gateway === 'snapscan'} disabled={payFastCheckoutEnabled} onChange={() => setGateway('snapscan')} /><Landmark size={20} /><span><strong>SnapScan</strong><small>{payFastCheckoutEnabled ? 'Merchant integration coming next' : 'Secure test checkout'}</small></span></label>
          </div>
        </section>
        <aside className="checkout-summary"><p className="eyebrow">Order summary</p>{lines.map((line) => <OrderLine key={line.listing.id} listing={line.listing} quantity={line.quantity} compact />)}<div className="summary-row"><span>Items</span><strong>R {total.toLocaleString('en-ZA')}</strong></div><div className="summary-row"><span>Collection</span><strong>R 0</strong></div><div className="summary-total"><span>Total</span><strong>R {total.toLocaleString('en-ZA')}</strong></div><button className="button button--primary button--block" type="submit" disabled={processing || sellerCount > 1}>{processing ? 'Starting payment…' : `Pay R ${total.toLocaleString('en-ZA')}`}</button><p><ShieldCheck size={15} />Sandbox · No real money</p></aside>
      </form>
    </div>
  )
}

function MapMarker() {
  return <span className="map-marker" aria-hidden="true" />
}
