import { Check, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { orderService } from '../../lib/orders'
import type { Order } from '../../types/marketplace'

export function OrderConfirmationPage() {
  const { orderId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [confirmationError, setConfirmationError] = useState('')
  const returnedFromPayFast = searchParams.get('payment') === 'return'
  useEffect(() => {
    let active = true
    orderService.findById(orderId)
      .then(async (found) => {
        if (!active) return
        if (found?.status === 'pending_payment' && returnedFromPayFast) {
          try {
            const confirmed = await orderService.completeSandboxPayment(orderId)
            if (active) setOrder(confirmed)
          } catch (caught) {
            if (active) {
              setConfirmationError(caught instanceof Error ? caught.message : 'Payment confirmation is taking longer than expected.')
              setOrder(found)
            }
          }
          return
        }
        setOrder(found)
      })
      .catch(() => { if (active) setOrder(null) })
    return () => { active = false }
  }, [orderId, returnedFromPayFast])
  if (order === undefined) return <div className="detail-loading" aria-busy="true"><span /><i /><i /></div>
  if (!order) return <EmptyState title="Order confirmation unavailable.">Open your order history to check the payment status.<Link className="button button--primary" to="/orders">View orders</Link></EmptyState>
  if (order.status === 'pending_payment') return (
    <main className="confirmation-page">
      <span className="confirmation-mark"><Clock3 size={29} /></span>
      <p className="eyebrow">Payment confirmation pending</p>
      <h1>We’re checking your payment.</h1>
      <p>{confirmationError || 'PayFast has returned you to Rekang. Your order will update as soon as the sandbox payment is confirmed.'}</p>
      <div className="confirmation-actions"><Link className="button button--primary" to={`/orders/${order.id}`}>Check order status</Link><Link className="button button--secondary" to="/orders">View orders</Link></div>
    </main>
  )
  if (order.status === 'cancelled') return <EmptyState title="Payment cancelled.">The listing has been released and no payment was recorded.<Link className="button button--primary" to="/home">Return to marketplace</Link></EmptyState>
  return (
    <main className="confirmation-page">
      <span className="confirmation-mark"><Check size={31} /></span>
      <p className="eyebrow">Order confirmed · PayFast sandbox</p>
      <h1>Your order is confirmed.</h1>
      <p>Your sandbox payment is recorded. The seller can now prepare your order for collection.</p>
      <dl><div><dt>Order number</dt><dd>{order.reference}</dd></div><div><dt>Payment</dt><dd>{order.gateway === 'payfast' ? 'PayFast' : 'SnapScan'} sandbox</dd></div><div><dt>Total</dt><dd>R {order.total.toLocaleString('en-ZA')}</dd></div><div><dt>Next step</dt><dd>Arrange campus collection</dd></div></dl>
      <div className="confirmation-actions"><Link className="button button--primary" to={`/orders/${order.id}`}>View order</Link><Link className="button button--secondary" to="/home">Continue shopping</Link></div>
    </main>
  )
}
