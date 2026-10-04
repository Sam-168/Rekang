import { createContext } from 'react'
import type { AppNotification } from '../types/community'

export type CommunityState = {
  notifications: AppNotification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
}

export const CommunityContext = createContext<CommunityState | null>(null)
