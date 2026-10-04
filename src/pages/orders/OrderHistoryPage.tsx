import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ProductImage } from '../../components/marketplace/ProductImage'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { listings } from '../../lib/listings'
import { orderService } from '../../lib/orders'
import type { Order } from '../../types/marketplace'

export function OrderHistoryPage() {
  const [mode, setMode] = useState<'buyer' | 'seller'>('buyer')
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    let active = true
    orderService.list(mode).then((items) => { if (active) setOrders(items) })
    return () => { active = false }
  }, [mode])

  function changeMode(next: 'buyer' | 'seller') {
    setOrders(null)
    setMode(next)
  }

  return (
    <div className="orders-page">
      <p className="eyebrow">Your account</p><h1>Your orders.</h1>
      <div className="segmented-control" aria-label="Order view"><button className={mode === 'buyer' ? 'is-active' : ''} type="button" onClick={() => changeMode('buyer')}>Purchases</button><button className={mode === 'seller' ? 'is-active' : ''} type="button" onClick={() => changeMode('seller')}>Sales</button></div>
      {orders === null ? <div className="order-list-loading" aria-busy="true"><span /><span /></div> : orders.length === 0 ? <EmptyState title="No orders yet.">{mode === 'buyer' ? 'Your purchases will appear here after checkout.' : 'Orders on your listings will appear here.'}<Link className="button button--primary" to="/home">Browse marketplace</Link></EmptyState> : (
        <div className="order-list">{orders.map((order) => {
          const listing = listings.find((item) => item.id === order.listingId)
          if (!listing) return null
          return <Link className="order-row" to={`/orders/${order.id}`} key={order.id}><ProductImage index={listing.imageIndex} alt={listing.title} /><div><span>{order.id}</span><strong>{listing.title}</strong><small>{new Date(order.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })} · {mode === 'buyer' ? `Seller: ${listing.seller.name}` : 'Buyer: Thabo Molefe'}</small></div><aside><OrderStatusBadge status={order.status} /><strong>R {order.total.toLocaleString('en-ZA')}</strong></aside><ChevronRight size={18} /></Link>
        })}</div>
      )}
    </div>
  )
}
