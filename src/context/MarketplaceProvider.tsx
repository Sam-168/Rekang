import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MarketplaceContext, defaultFilters } from './MarketplaceContext'
import type { CartLine, Listing, ListingFilters } from '../types/marketplace'
import { cartService } from '../lib/listings'
import { useAuth } from './useAuth'

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [filters, setFilters] = useState<ListingFilters>(() => ({ ...defaultFilters, campus: profile?.campus ?? defaultFilters.campus }))
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartListings, setCartListings] = useState<Record<string, Listing>>({})
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState('')

  const reloadCart = useCallback(async () => {
    if (!user) {
      setCart([])
      setCartListings({})
      setCartLoading(false)
      return
    }
    setCartLoading(true)
    setCartError('')
    try {
      const result = await cartService.list(user.id)
      setCart(result.lines)
      setCartListings(Object.fromEntries(result.listings.map((listing) => [listing.id, listing])))
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'Your cart could not be loaded.')
    } finally {
      setCartLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timeout = window.setTimeout(() => { void reloadCart() }, 0)
    return () => window.clearTimeout(timeout)
  }, [reloadCart])

  const value = useMemo(() => ({
    filters,
    setFilters,
    cart,
    cartListings,
    cartLoading,
    cartError,
    reloadCart,
    async addToCart(listingId: string) {
      if (!user || cart.some((line) => line.listingId === listingId)) return
      setCartError('')
      setCart((current) => [...current, { listingId, quantity: 1 }])
      try {
        await cartService.add(user.id, listingId)
        await reloadCart()
      } catch (error) {
        setCart((current) => current.filter((line) => line.listingId !== listingId))
        setCartError(error instanceof Error ? error.message : 'The item could not be added to your cart.')
        throw error
      }
    },
    async removeFromCart(listingId: string) {
      if (!user) return
      setCartError('')
      const previous = cart
      setCart((current) => current.filter((line) => line.listingId !== listingId))
      try {
        await cartService.remove(user.id, listingId)
        setCartListings((current) => { const next = { ...current }; delete next[listingId]; return next })
      } catch (error) {
        setCart(previous)
        setCartError(error instanceof Error ? error.message : 'The item could not be removed.')
      }
    },
    async setQuantity(listingId: string, quantity: number) {
      if (!user) return
      setCartError('')
      const nextQuantity = Math.max(1, Math.min(quantity, 5))
      const previous = cart
      setCart((current) => current.map((line) => line.listingId === listingId ? { ...line, quantity: nextQuantity } : line))
      try {
        await cartService.setQuantity(user.id, listingId, nextQuantity)
      } catch (error) {
        setCart(previous)
        setCartError(error instanceof Error ? error.message : 'The quantity could not be updated.')
      }
    },
    async clearCart() {
      if (!user) return
      setCartError('')
      const previousCart = cart
      const previousListings = cartListings
      setCart([])
      setCartListings({})
      try {
        await cartService.clear(user.id)
      } catch (error) {
        setCart(previousCart)
        setCartListings(previousListings)
        setCartError(error instanceof Error ? error.message : 'The cart could not be cleared.')
      }
    },
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
  }), [cart, cartError, cartListings, cartLoading, filters, reloadCart, user])

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
}
