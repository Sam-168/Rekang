import { useMemo, useState, type ReactNode } from 'react'
import { MarketplaceContext, defaultFilters } from './MarketplaceContext'
import type { CartLine, ListingFilters } from '../types/marketplace'

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters)
  const [cart, setCart] = useState<CartLine[]>([])

  const value = useMemo(() => ({
    filters,
    setFilters,
    cart,
    addToCart(listingId: string) {
      setCart((current) => current.some((line) => line.listingId === listingId)
        ? current
        : [...current, { listingId, quantity: 1 }])
    },
    removeFromCart(listingId: string) {
      setCart((current) => current.filter((line) => line.listingId !== listingId))
    },
    setQuantity(listingId: string, quantity: number) {
      setCart((current) => current.map((line) => line.listingId === listingId
        ? { ...line, quantity: Math.max(1, Math.min(quantity, 5)) }
        : line))
    },
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
  }), [cart, filters])

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}
