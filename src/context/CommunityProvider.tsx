import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { notificationService } from '../lib/community'
import type { AppNotification } from '../types/community'
import { CommunityContext } from './CommunityContext'
import { useAuth } from './useAuth'

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(Boolean(user))
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      setError('')
      setNotifications(await notificationService.list())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Notifications could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let active = true
    if (!user) {
      Promise.resolve().then(() => { if (active) { setNotifications([]); setLoading(false) } })
      return () => { active = false }
    }
    notificationService.list()
      .then((items) => { if (active) { setNotifications(items); setError('') } })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Notifications could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    const unsubscribe = notificationService.subscribe(user.id, () => { void reload() })
    return () => { active = false; unsubscribe() }
  }, [reload, user])

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    loading,
    error,
    reload,
    async markRead(id: string) {
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item))
      try { await notificationService.markRead(id) }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Notification could not be updated.'); await reload() }
    },
    async markAllRead() {
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
      try { await notificationService.markAllRead() }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Notifications could not be updated.'); await reload() }
    },
  }), [error, loading, notifications, reload])
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
}
