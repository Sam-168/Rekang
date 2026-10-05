import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Notice } from '../../components/auth/Notice'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { OrderLine } from '../../components/orders/OrderLine'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { useAuth } from '../../context/useAuth'
import { orderService } from '../../lib/orders'
import type { Order, OrderStatus } from '../../types/marketplace'

export function OrderDetailPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { orderService.findById(orderId).then(setOrder).catch(() => setOrder(null)) }, [orderId])

  async function advance(status: Extract<OrderStatus, 'ready_for_collection' | 'completed' | 'cancelled'>) {
    setError(''); setSaving(true)
    try { setOrder(await orderService.advance(orderId, status)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'The order could not be updated.') }
    finally { setSaving(false) }
  }

  async function retryPayment() {
    setError(''); setSaving(true)
    try { setOrder(await orderService.completeSandboxPayment(orderId)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'The sandbox payment could not be completed.') }
    finally { setSaving(false) }
  }

  if (order === undefined) return <div className="detail-loading" aria-busy="true"><span /><i /><i /></div>
  if (!order) return <EmptyState title="Order not found.">Check the order number or return to your history.<Link className="button button--primary" to="/orders">View order history</Link></EmptyState>
  const buyer = order.buyerId === user?.id
  const seller = order.items.some((item) => item.sellerId === user?.id)
  const reviewable = orderService.canReview(order, user?.id)
  return (
    <div className="order-detail-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back to orders</button>
      <div className="order-detail-heading"><div><p className="eyebrow">{buyer ? 'Your purchase' : 'Your sale'}</p><h1>Order {order.reference}.</h1></div><OrderStatusBadge status={order.status} /></div>
      {error && <Notice error>{error}</Notice>}
      <div className="order-detail-lines">{order.items.map((item) => <OrderLine key={item.id} listing={item.listing} quantity={item.quantity} />)}</div>
      <div className="order-detail-grid"><section><h2>Collection</h2><p><MapPin size={16} />Bellville campus library</p><span>Collector: {order.collectionName} · {order.collectionPhone}</span>{order.collectionNote && <span>{order.collectionNote}</span>}</section><section><h2>Payment</h2><p><ShieldCheck size={16} />{order.gateway === 'payfast' ? 'PayFast' : 'SnapScan'} sandbox</p><span>{order.status === 'pending_payment' ? 'Payment is still pending.' : 'Sandbox payment recorded · no real money charged.'}</span></section></div>
      <div className="order-total"><span>Total</span><strong>R {order.total.toLocaleString('en-ZA')}</strong></div>
      <div className="order-actions">
        {buyer && order.status === 'pending_payment' && <><button className="button button--primary" type="button" disabled={saving} onClick={retryPayment}>Complete sandbox payment</button><button className="button button--secondary" type="button" disabled={saving} onClick={() => void advance('cancelled')}>Cancel order</button></>}
        {seller && order.status === 'paid' && <button className="button button--primary" type="button" disabled={saving} onClick={() => void advance('ready_for_collection')}>Mark ready for collection</button>}
        {buyer && order.status === 'ready_for_collection' && <button className="button button--primary" type="button" disabled={saving} onClick={() => void advance('completed')}>Confirm collection</button>}
        {reviewable ? <Link className="button button--primary" to={`/orders/${order.id}/review`}>Leave a review</Link> : order.status === 'completed' && order.reviewed ? <p className="review-note">A review has already been submitted for this purchase.</p> : buyer ? <p className="review-note">You can leave a review after the order is completed.</p> : null}
      </div>
    </div>
  )
}
