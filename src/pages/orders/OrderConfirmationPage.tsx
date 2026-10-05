import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { orderService } from '../../lib/orders'
import type { Order } from '../../types/marketplace'

export function OrderConfirmationPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  useEffect(() => { orderService.findById(orderId).then(setOrder).catch(() => setOrder(null)) }, [orderId])
  if (order === undefined) return <div className="detail-loading" aria-busy="true"><span /><i /><i /></div>
  if (!order) return <EmptyState title="Order confirmation unavailable.">Open your order history to check the payment status.<Link className="button button--primary" to="/orders">View orders</Link></EmptyState>
  return (
    <main className="confirmation-page">
      <span className="confirmation-mark"><Check size={31} /></span>
      <p className="eyebrow">Payment successful · sandbox</p>
      <h1>You’re all set.</h1>
      <p>Your sandbox payment is recorded. The seller can now prepare your order for collection.</p>
      <dl><div><dt>Order number</dt><dd>{order.reference}</dd></div><div><dt>Payment</dt><dd>{order.gateway === 'payfast' ? 'PayFast' : 'SnapScan'} sandbox</dd></div><div><dt>Total</dt><dd>R {order.total.toLocaleString('en-ZA')}</dd></div><div><dt>Next step</dt><dd>Arrange campus collection</dd></div></dl>
      <div className="confirmation-actions"><Link className="button button--primary" to={`/orders/${order.id}`}>View order</Link><Link className="button button--secondary" to="/home">Continue shopping</Link></div>
    </main>
  )
}
