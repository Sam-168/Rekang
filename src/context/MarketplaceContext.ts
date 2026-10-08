import { createContext } from 'react'
import type { CartLine, Listing, ListingFilters } from '../types/marketplace'

export type MarketplaceState = {
  filters: ListingFilters
  setFilters: (filters: ListingFilters) => void
  cart: CartLine[]
  cartListings: Record<string, Listing>
  cartLoading: boolean
  cartError: string
  addToCart: (listingId: string) => Promise<void>
  removeFromCart: (listingId: string) => Promise<void>
  setQuantity: (listingId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  reloadCart: () => Promise<void>
  cartCount: number
}

export const marketplaceMaxPrice = 100_000
export const defaultFilters: ListingFilters = { query: '', category: 'All', minPrice: 0, maxPrice: marketplaceMaxPrice, campus: 'Bellville' }
export const MarketplaceContext = createContext<MarketplaceState | null>(null)
