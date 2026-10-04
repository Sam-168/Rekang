export const categories = ['All', 'Books', 'Electronics', 'Home', 'Services'] as const
export type ListingCategory = Exclude<(typeof categories)[number], 'All'>

export type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: ListingCategory
  campus: string
  seller: {
    id: string
    name: string
    initials: string
    verified: boolean
    rating: number
    reviews: number
  }
  imageIndex: number
  status: 'available' | 'sold'
  condition: string
  postedLabel: string
}

export type ListingFilters = {
  query: string
  category: (typeof categories)[number]
  minPrice: number
  maxPrice: number
  campus: string
}

export type CartLine = {
  listingId: string
  quantity: number
}

export type PaymentGateway = 'payfast' | 'snapscan'
export type OrderStatus = 'paid' | 'ready_for_collection' | 'completed' | 'cancelled'

export type Order = {
  id: string
  listingId: string
  quantity: number
  buyerId: string
  sellerId: string
  status: OrderStatus
  total: number
  gateway: PaymentGateway
  createdAt: string
}

export type Review = {
  id: string
  orderId: string
  sellerId: string
  reviewerName: string
  rating: number
  comment: string
  createdAt: string
}
