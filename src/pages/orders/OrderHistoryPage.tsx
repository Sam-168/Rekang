import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Notice } from '../../components/auth/Notice'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { ProductImage } from '../../components/marketplace/ProductImage'
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge'
import { orderService } from '../../lib/orders'
import type { Order } from '../../types/marketplace'

export function OrderHistoryPage() {
  const [mode, setMode] = useState<'buyer' | 'seller'>('buyer')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    orderService.list(mode)
      .then((items) => { if (active) setOrders(items) })
      .catch((caught) => { if (active) { setOrders([]); setError(caught instanceof Error ? caught.message : 'Orders could not be loaded.') } })
    return () => { active = false }
  }, [mode, version])

  function changeMode(next: 'buyer' | 'seller') {
    setOrders(null)
    setError('')
    setMode(next)
  }

  return (
    <div className="orders-page">
      <p className="eyebrow">Your account</p><h1>Your orders.</h1>
      <div className="segmented-control" aria-label="Order view"><button className={mode === 'buyer' ? 'is-active' : ''} type="button" onClick={() => changeMode('buyer')}>Purchases</button><button className={mode === 'seller' ? 'is-active' : ''} type="button" onClick={() => changeMode('seller')}>Sales</button></div>
      {error && <Notice error>{error}<button className="text-link text-link--button" type="button" onClick={() => { setOrders(null); setError(''); setVersion((value) => value + 1) }}>Try again</button></Notice>}
      {orders === null ? <div className="order-list-loading" aria-busy="true"><span /><span /></div> : orders.length === 0 ? <EmptyState title="No orders yet.">{mode === 'buyer' ? 'Your purchases will appear here after checkout.' : 'Orders on your listings will appear here.'}<Link className="button button--primary" to="/home">Browse marketplace</Link></EmptyState> : (
        <div className="order-list">{orders.map((order) => {
          const first = order.items[0]
          if (!first) return null
          const extra = order.items.length - 1
          return <Link className="order-row" to={`/orders/${order.id}`} key={order.id}><ProductImage index={first.listing.imageIndex} imageUrl={first.listing.imageUrl} alt={first.title} /><div><span>{order.reference}</span><strong>{first.title}{extra > 0 ? ` + ${extra} more` : ''}</strong><small>{new Date(order.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })} · {mode === 'buyer' ? `Seller: ${first.listing.seller.name}` : `Buyer: ${order.buyerName}`}</small></div><aside><OrderStatusBadge status={order.status} /><strong>R {order.total.toLocaleString('en-ZA')}</strong></aside><ChevronRight size={18} /></Link>
        })}</div>
      )}
    </div>
  )
}
