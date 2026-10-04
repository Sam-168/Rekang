import { useMemo, useState, type ReactNode } from 'react'
import { CommunityContext } from './CommunityContext'
import type { AppNotification } from '../types/community'

const initialNotifications: AppNotification[] = [
  { id: 'notification-1', title: 'Order paid', message: 'Your order RK-1042 is ready to arrange collection.', href: '/orders/RK-1042', createdAt: '2026-10-04T13:55:00+02:00', read: false, type: 'order' },
  { id: 'notification-2', title: 'A new review', message: 'Thabo left a review on your seller profile.', href: '/sellers/naledi?tab=reviews', createdAt: '2026-10-04T13:00:00+02:00', read: false, type: 'review' },
  { id: 'notification-3', title: 'Study group tomorrow', message: 'Accounting, together starts tomorrow at 16:00.', href: '/community/accounting-study-group', createdAt: '2026-10-03T16:00:00+02:00', read: true, type: 'community' },
  { id: 'notification-4', title: 'Account verified', message: 'Your university email is confirmed.', href: '/verify', createdAt: '2026-10-02T09:30:00+02:00', read: true, type: 'account' },
]

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    markRead(id: string) { setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)) },
    markAllRead() { setNotifications((current) => current.map((item) => ({ ...item, read: true }))) },
  }), [notifications])
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
}
