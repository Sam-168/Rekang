import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function LoadingSession() {
  return <div className="session-loading" role="status"><span />Checking your account…</div>
}

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingSession />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function GuestOnly() {
  const { session, loading } = useAuth()
  if (loading) return <LoadingSession />
  if (session) return <Navigate to="/home" replace />
  return <Outlet />
}
