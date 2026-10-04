import { useContext } from 'react'
import { MarketplaceContext } from './MarketplaceContext'

export function useMarketplace() {
  const context = useContext(MarketplaceContext)
  if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider')
  return context
}
