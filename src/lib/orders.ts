import { supabase } from './supabase'
import { listingService } from './listings'
import type { Order, OrderStatus, PaymentGateway, Review } from '../types/marketplace'

type OrderRecord = {
  id: string
  reference: string
  buyer_id: string
  status: OrderStatus
  payment_gateway: PaymentGateway
  payment_reference: string | null
  total: number | string
  collection_name: string
  collection_phone: string
  collection_note: string
  created_at: string
  updated_at: string
}

type ItemRecord = {
  id: string
  order_id: string
  listing_id: string
  seller_id: string
  title_snapshot: string
  unit_price: number | string
  quantity: number
}

type CheckoutInput = {
  gateway: PaymentGateway
  collectionName: string
  collectionPhone: string
  collectionNote: string
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured for this environment.')
  return supabase
}

function readableError(error: { message: string }) {
  if (error.message.includes('one seller')) return 'Checkout currently supports items from one seller at a time. Remove the other seller’s items and place a separate order.'
  if (error.message.includes('no available') || error.message.includes('no longer available')) return 'One or more cart items are no longer available.'
  if (error.message.includes('own listing')) return 'You cannot purchase your own listing.'
  if (error.message.includes('Verify your account')) return 'Verify your account before checking out.'
  if (error.message.includes('phone')) return 'Enter a valid collection phone number.'
  if (error.message.includes('collection name')) return 'Enter the name of the person collecting the order.'
  if (error.message.includes('transition')) return 'That order status change is not allowed.'
  return error.message
}

async function currentUserId() {
  const client = requireClient()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Sign in again to continue.')
  return data.user.id
}

async function hydrateOrders(records: OrderRecord[]) {
  if (!records.length) return []
  const client = requireClient()
  const orderIds = records.map((order) => order.id)
  const buyerIds = [...new Set(records.map((order) => order.buyer_id))]
  const [{ data: itemRows, error: itemError }, { data: buyerRows, error: buyerError }, { data: reviewRows, error: reviewError }] = await Promise.all([
    client.from('order_items').select('id, order_id, listing_id, seller_id, title_snapshot, unit_price, quantity').in('order_id', orderIds),
    client.from('profiles').select('id, full_name').in('id', buyerIds),
    client.from('reviews').select('order_id').in('order_id', orderIds),
  ])
  if (itemError || buyerError || reviewError) throw new Error(readableError(itemError ?? buyerError ?? reviewError!))
  const items = itemRows as ItemRecord[]
  const liveListings = await listingService.findByIds(items.map((item) => item.listing_id))
  const listingMap = new Map(liveListings.map((listing) => [listing.id, listing]))
  const buyerMap = new Map((buyerRows ?? []).map((buyer) => [buyer.id, buyer.full_name]))
  const reviewedOrders = new Set((reviewRows ?? []).map((review) => review.order_id))

  return records.map<Order>((record) => ({
    id: record.id,
    reference: record.reference,
    buyerId: record.buyer_id,
    buyerName: buyerMap.get(record.buyer_id) ?? 'Rekang member',
    status: record.status,
    total: Number(record.total),
    gateway: record.payment_gateway,
    paymentReference: record.payment_reference,
    collectionName: record.collection_name,
    collectionPhone: record.collection_phone,
    collectionNote: record.collection_note,
    items: items.filter((item) => item.order_id === record.id).flatMap((item) => {
      const listing = listingMap.get(item.listing_id)
      return listing ? [{
        id: item.id, listingId: item.listing_id, sellerId: item.seller_id,
        title: item.title_snapshot, unitPrice: Number(item.unit_price), quantity: item.quantity, listing,
      }] : []
    }),
    reviewed: reviewedOrders.has(record.id),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }))
}

async function findOrderRecord(id: string) {
  const client = requireClient()
  const { data, error } = await client.from('orders').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(readableError(error))
  return data as OrderRecord | null
}

export const orderService = {
  async create(input: CheckoutInput) {
    const client = requireClient()
    const { data: created, error: createError } = await client.rpc('create_order_from_cart', {
      checkout_gateway: input.gateway,
      checkout_collection_name: input.collectionName,
      checkout_collection_phone: input.collectionPhone,
      checkout_collection_note: input.collectionNote,
    })
    if (createError) throw new Error(readableError(createError))
    const orderId = (created as OrderRecord).id
    const { error: paymentError } = await client.rpc('complete_sandbox_payment', { target_order_id: orderId })
    if (paymentError) throw new Error(`Order created, but sandbox payment could not finish: ${readableError(paymentError)}`)
    const record = await findOrderRecord(orderId)
    const order = record ? (await hydrateOrders([record]))[0] : null
    if (!order) throw new Error('The order was created but could not be reloaded.')
    return order
  },

  async list(mode: 'buyer' | 'seller') {
    const client = requireClient()
    const userId = await currentUserId()
    let orderIds: string[] | null = null
    if (mode === 'seller') {
      const { data: rows, error } = await client.from('order_items').select('order_id').eq('seller_id', userId)
      if (error) throw new Error(readableError(error))
      orderIds = [...new Set((rows ?? []).map((row) => row.order_id))]
      if (!orderIds.length) return []
    }
    let query = client.from('orders').select('*').order('created_at', { ascending: false })
    query = mode === 'buyer' ? query.eq('buyer_id', userId) : query.in('id', orderIds!)
    const { data, error } = await query
    if (error) throw new Error(readableError(error))
    return hydrateOrders(data as OrderRecord[])
  },

  async findById(id: string) {
    const record = await findOrderRecord(id)
    if (!record) return null
    return (await hydrateOrders([record]))[0] ?? null
  },

  canReview(order: Order, userId: string | undefined) {
    return order.buyerId === userId && order.status === 'completed' && !order.reviewed && order.items.length > 0
  },

  async submitReview(input: { orderId: string; sellerId: string; rating: number; comment: string }) {
    const client = requireClient()
    const reviewerId = await currentUserId()
    const { data, error } = await client.from('reviews').insert({
      order_id: input.orderId, seller_id: input.sellerId, reviewer_id: reviewerId,
      rating: input.rating, comment: input.comment,
    }).select('id, order_id, seller_id, rating, comment, created_at').single()
    if (error) throw new Error(readableError(error))
    const { data: profile } = await client.from('profiles').select('full_name').eq('id', reviewerId).maybeSingle()
    return {
      id: data.id, orderId: data.order_id, sellerId: data.seller_id,
      reviewerName: profile?.full_name ?? 'Rekang member', rating: data.rating,
      comment: data.comment, createdAt: data.created_at,
    } satisfies Review
  },

  async advance(id: string, status: Extract<OrderStatus, 'ready_for_collection' | 'completed' | 'cancelled'>) {
    const client = requireClient()
    const { error } = await client.rpc('advance_order_status', { target_order_id: id, next_status: status })
    if (error) throw new Error(readableError(error))
    const record = await findOrderRecord(id)
    const order = record ? (await hydrateOrders([record]))[0] : null
    if (!order) throw new Error('The updated order could not be reloaded.')
    return order
  },

  async completeSandboxPayment(id: string) {
    const client = requireClient()
    const { error } = await client.rpc('complete_sandbox_payment', { target_order_id: id })
    if (error) throw new Error(readableError(error))
    const record = await findOrderRecord(id)
    const order = record ? (await hydrateOrders([record]))[0] : null
    if (!order) throw new Error('The paid order could not be reloaded.')
    return order
  },
}
