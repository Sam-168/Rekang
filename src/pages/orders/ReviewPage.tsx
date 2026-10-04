import { Star } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Notice } from '../../components/auth/Notice'
import { EmptyState } from '../../components/marketplace/EmptyState'
import { listings } from '../../lib/listings'
import { orderService } from '../../lib/orders'
import type { Order } from '../../types/marketplace'

export function ReviewPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => { orderService.findById(orderId).then(setOrder) }, [orderId])
  if (order === undefined) return <div className="detail-loading" aria-busy="true"><span /><i /></div>
  if (!order) return <EmptyState title="Review unavailable.">We couldn’t find this order.<Link className="button button--primary" to="/orders">View order history</Link></EmptyState>
  if (submitted) return <div className="confirmation-page"><span className="confirmation-mark"><Star size={29} fill="currentColor" /></span><p className="eyebrow">Review submitted</p><h1>Thanks for your review.</h1><p>Your feedback helps the community buy with confidence.</p><Link className="button button--primary" to={`/sellers/${order.sellerId}?tab=reviews`}>View seller reviews</Link></div>
  if (!orderService.canReview(order)) return <EmptyState title="Review unavailable.">Only buyers with a completed, unreviewed order can leave a review.<Link className="button button--primary" to={`/orders/${orderId}`}>View order</Link></EmptyState>
  const listing = listings.find((item) => item.id === order.listingId)
  if (!listing) return null

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (comment.trim().length < 10) return setError('Write at least 10 characters about your purchase.')
    setError(''); setSubmitting(true)
    await orderService.submitReview({ orderId, sellerId: order!.sellerId, rating, comment: comment.trim() })
    setSubmitting(false); setSubmitted(true)
  }

  return (
    <main className="review-page"><p className="eyebrow">Verified purchase</p><h1>How was your purchase?</h1><p>Review {listing.seller.name} for order {order.id}.</p>{error && <Notice error>{error}</Notice>}<form onSubmit={submit}><fieldset><legend>Rating</legend><div className="rating-input">{[1,2,3,4,5].map((value) => <button key={value} type="button" aria-label={`${value} star${value === 1 ? '' : 's'}`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star size={24} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}</div><small>1 = poor · 5 = excellent</small></fieldset><label><span>Your review</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} placeholder="What went well? Was the listing accurate?" required /><small>{comment.length} / 500</small></label><button className="button button--primary button--block" type="submit" disabled={submitting}>{submitting ? 'Submitting review…' : 'Submit review'}</button></form></main>
  )
}
