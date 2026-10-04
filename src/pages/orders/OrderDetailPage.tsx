import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { OrderLine } from '../../components/orders/OrderLine'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { listings } from '../../lib/listings'
import { orderService } from '../../lib/orders'
import type { Order } from '../../types/marketplace'

export function OrderDetailPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  useEffect(() => { orderService.findById(orderId).then(setOrder) }, [orderId])
  if (order === undefined) return <div className="detail-loading" aria-busy="true"><span /><i /><i /></div>
  if (!order) return <EmptyState title="Order not found.">Check the order number or return to your history.<Link className="button button--primary" to="/orders">View order history</Link></EmptyState>
  const listing = listings.find((item) => item.id === order.listingId)
  if (!listing) return null
  const reviewable = orderService.canReview(order)
  return (
    <div className="order-detail-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}><ArrowLeft size={18} />Back to orders</button>
      <div className="order-detail-heading"><div><p className="eyebrow">Your purchase</p><h1>Order {order.id}.</h1></div><OrderStatusBadge status={order.status} /></div>
      <OrderLine listing={listing} quantity={order.quantity} />
      <div className="order-detail-grid"><section><h2>Collection</h2><p><MapPin size={16} />Bellville campus library</p><span>Confirm a collection time with {listing.seller.name}.</span></section><section><h2>Payment</h2><p><ShieldCheck size={16} />{order.gateway === 'payfast' ? 'PayFast' : 'SnapScan'} sandbox</p><span>No real money was charged.</span></section></div>
      <div className="order-total"><span>Total</span><strong>R {order.total.toLocaleString('en-ZA')}</strong></div>
      {reviewable ? <Link className="button button--primary" to={`/orders/${order.id}/review`}>Leave a review</Link> : order.status === 'completed' ? <p className="review-note">A review has already been submitted for this purchase.</p> : <p className="review-note">You can leave a review after the order is completed.</p>}
    </div>
  )
}
