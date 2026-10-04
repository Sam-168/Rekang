import { Bell, Home, Megaphone, Plus, ShoppingBag, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMarketplace } from '../../context/useMarketplace'
import { useCommunity } from '../../context/useCommunity'

const navItems = [
  { to: '/home', label: 'Market', icon: Home },
  { to: '/community', label: 'Community', icon: Megaphone },
  { to: '/listings/new', label: 'Sell', icon: Plus },
  { to: '/orders', label: 'Account', icon: UserRound },
]

export function AppShell() {
  const { cartCount } = useMarketplace()
  const { unreadCount } = useCommunity()
  const location = useLocation()
  const showBottomNav = ['/home', '/community', '/listings/new', '/orders'].includes(location.pathname)

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/home" className="brand" aria-label="Rekang marketplace">rekang.</NavLink>
        <div className="app-header__actions">
          <NavLink className="icon-button" to="/notifications" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="cart-count notification-count">{unreadCount}</span>}
          </NavLink>
          <NavLink className="icon-button cart-link" to="/cart" aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </NavLink>
        </div>
      </header>
      <main className="app-main"><Outlet /></main>
      {showBottomNav && (
        <nav className="bottom-nav" aria-label="Primary navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'bottom-nav__item is-active' : 'bottom-nav__item'}>
              <Icon size={20} aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
