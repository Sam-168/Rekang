import { createContext } from 'react'
import type { AppNotification } from '../types/community'

export type CommunityState = {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  error: string
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  reload: () => Promise<void>
}

export const CommunityContext = createContext<CommunityState | null>(null)
