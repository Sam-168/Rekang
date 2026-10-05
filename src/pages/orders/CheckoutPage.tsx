import { ArrowLeft, CreditCard, Landmark, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Notice } from '../../components/auth/Notice'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { OrderLine } from '../../components/orders/OrderLine'
import { useMarketplace } from '../../context/useMarketplace'
import { orderService } from '../../lib/orders'
import type { PaymentGateway } from '../../types/marketplace'

export function CheckoutPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { cart, cartListings, clearCart } = useMarketplace()
  const [gateway, setGateway] = useState<PaymentGateway>('payfast')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(params.get('state') === 'failed' ? 'Payment wasn’t completed. No payment was taken. Try again or choose another method.' : '')
  const lines = cart.flatMap((line) => {
    const listing = cartListings[line.listingId]
    return listing ? [{ ...line, listing }] : []
  })
  const total = lines.reduce((sum, line) => sum + line.listing.price * line.quantity, 0)

  async function pay(event: FormEvent) {
    event.preventDefault()
    setError('')
    setProcessing(true)
    try {
      const order = await orderService.create(cart, gateway)
      await clearCart()
      navigate(`/orders/${order.id}/confirmation`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Payment could not be started.')
      setProcessing(false)
    }
  }

  if (lines.length === 0) {
    return <div className="task-page"><EmptyState title="Your cart is empty.">Add an item before starting checkout.<Link className="button button--primary" to="/home">Browse marketplace</Link></EmptyState></div>
  }

  return (
    <div className="task-page">
      <header className="task-header"><button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back to cart</button><span>Secure sandbox checkout</span></header>
      <form className="checkout-layout" onSubmit={pay}>
        <section>
          <p className="eyebrow">Checkout</p><h1>Complete your order.</h1><p className="page-copy">Review your item and select a test payment method.</p>
          <Notice><strong>Sandbox payment</strong><br />No real money will be charged.</Notice>
          {error && <Notice error>{error}</Notice>}
          <h2>Collection</h2><div className="collection-option"><MapMarker /><div><strong>Bellville campus library</strong><span>Arrange a collection time with the seller after payment.</span></div></div>
          <h2>Payment method</h2>
          <div className="payment-options">
            <label><input type="radio" name="gateway" checked={gateway === 'payfast'} onChange={() => setGateway('payfast')} /><CreditCard size={20} /><span><strong>PayFast</strong><small>Secure test checkout</small></span></label>
            <label><input type="radio" name="gateway" checked={gateway === 'snapscan'} onChange={() => setGateway('snapscan')} /><Landmark size={20} /><span><strong>SnapScan</strong><small>Secure test checkout</small></span></label>
          </div>
        </section>
        <aside className="checkout-summary"><p className="eyebrow">Order summary</p>{lines.map((line) => <OrderLine key={line.listing.id} listing={line.listing} quantity={line.quantity} compact />)}<div className="summary-row"><span>Items</span><strong>R {total.toLocaleString('en-ZA')}</strong></div><div className="summary-row"><span>Collection</span><strong>R 0</strong></div><div className="summary-total"><span>Total</span><strong>R {total.toLocaleString('en-ZA')}</strong></div><button className="button button--primary button--block" type="submit" disabled={processing}>{processing ? 'Processing test payment…' : `Pay R ${total.toLocaleString('en-ZA')} · test payment`}</button><p><ShieldCheck size={15} />Sandbox · No real money</p></aside>
      </form>
    </div>
  )
}

function MapMarker() {
  return <span className="map-marker" aria-hidden="true" />
}
