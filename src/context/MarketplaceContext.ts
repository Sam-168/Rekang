import { createContext } from 'react'
import type { CartLine, ListingFilters } from '../types/marketplace'

export type MarketplaceState = {
  filters: ListingFilters
  setFilters: (filters: ListingFilters) => void
  cart: CartLine[]
  addToCart: (listingId: string) => void
  removeFromCart: (listingId: string) => void
  setQuantity: (listingId: string, quantity: number) => void
  cartCount: number
}

export const defaultFilters: ListingFilters = { query: '', category: 'All', minPrice: 0, maxPrice: 5000, campus: 'Bellville' }
export const MarketplaceContext = createContext<MarketplaceState | null>(null)
