import { listings } from './listings'
import type { CartLine, Order, PaymentGateway, Review } from '../types/marketplace'

const orders: Order[] = [
  { id: 'RK-1042', listingId: 'textbooks', quantity: 1, buyerId: 'current-user', sellerId: 'naledi', status: 'paid', total: 280, gateway: 'payfast', createdAt: '2026-10-04T09:10:00+02:00' },
  { id: 'RK-1031', listingId: 'desk-lamp', quantity: 1, buyerId: 'current-user', sellerId: 'aisha', status: 'completed', total: 180, gateway: 'payfast', createdAt: '2026-09-29T13:30:00+02:00' },
  { id: 'RK-1027', listingId: 'headphones', quantity: 1, buyerId: 'thabo', sellerId: 'current-user', status: 'ready_for_collection', total: 650, gateway: 'snapscan', createdAt: '2026-09-26T11:15:00+02:00' },
]

const reviews: Review[] = [
  { id: 'review-1', orderId: 'RK-1001', sellerId: 'naledi', reviewerName: 'Thabo Molefe', rating: 5, comment: 'Books were exactly as described. Easy collection at the library.', createdAt: '2026-09-29' },
  { id: 'review-2', orderId: 'RK-1000', sellerId: 'naledi', reviewerName: 'Aisha Jacobs', rating: 4, comment: 'Good condition and a fair price.', createdAt: '2026-09-21' },
]

const wait = (milliseconds = 400) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export const orderService = {
  async create(cart: CartLine[], gateway: PaymentGateway) {
    await wait(650)
    const first = cart[0]
    const listing = listings.find((item) => item.id === first?.listingId)
    if (!first || !listing) throw new Error('Your cart no longer contains an available listing.')
    const order: Order = {
      id: `RK-${1050 + orders.length}`,
      listingId: first.listingId,
      quantity: first.quantity,
      buyerId: 'current-user',
      sellerId: listing.seller.id,
      status: 'paid',
      total: listing.price * first.quantity,
      gateway,
      createdAt: new Date().toISOString(),
    }
    orders.unshift(order)
    return order
  },

  async list(mode: 'buyer' | 'seller') {
    await wait()
    return orders.filter((order) => mode === 'buyer' ? order.buyerId === 'current-user' : order.sellerId === 'current-user')
  },

  async findById(id: string) {
    await wait(220)
    return orders.find((order) => order.id === id) ?? null
  },

  canReview(order: Order) {
    return order.buyerId === 'current-user' && order.status === 'completed' && !reviews.some((review) => review.orderId === order.id)
  },

  async submitReview(input: Omit<Review, 'id' | 'createdAt' | 'reviewerName'>) {
    await wait(500)
    const review: Review = { ...input, id: `review-${reviews.length + 1}`, createdAt: new Date().toISOString().slice(0, 10), reviewerName: 'Current user' }
    reviews.unshift(review)
    return review
  },

  async reviewsForSeller(sellerId: string) {
    await wait(260)
    return reviews.filter((review) => review.sellerId === sellerId)
  },
}
