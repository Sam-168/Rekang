import { Bell, CheckCheck, Megaphone, MessageSquareText, PackageCheck, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCommunity } from '../../context/useCommunity'
import type { AppNotification } from '../../types/community'

const icons = { order: PackageCheck, review: MessageSquareText, community: Megaphone, account: ShieldCheck }

export function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useCommunity()
  const navigate = useNavigate()
  function open(item: AppNotification) { markRead(item.id); navigate(item.href) }

  return (
    <div className="notifications-page">
      <header className="notifications-heading"><div><p className="eyebrow">Inbox</p><h1>Notifications.</h1><p>{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You’re all caught up.'}</p></div>{unreadCount > 0 && <button className="text-action" type="button" onClick={markAllRead}><CheckCheck size={17} /> Mark all as read</button>}</header>
      {notifications.length ? <section className="notification-list" aria-label="Notifications">{notifications.map((item) => {
        const Icon = icons[item.type]
        return <button key={item.id} type="button" className={`notification-row${item.read ? '' : ' is-unread'}`} onClick={() => open(item)}><span className="notification-icon"><Icon size={19} /></span><span className="notification-copy"><strong>{item.title}</strong><span>{item.message}</span><small>{new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}</small></span>{!item.read && <i aria-label="Unread" />}</button>
      })}</section> : <div className="community-empty"><Bell size={26} /><h2>No notifications yet.</h2><p>Updates about orders and campus activity will appear here.</p><Link className="button button--secondary" to="/home">Browse marketplace</Link></div>}
    </div>
  )
}
