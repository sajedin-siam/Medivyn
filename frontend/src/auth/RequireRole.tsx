import { Navigate, Outlet, useLocation } from 'react-router'
import type { Role } from '../api/types'
import { HOME_BY_ROLE, useAuth } from './useAuth'

/** Hides screens from the wrong role. The backend still checks every request. */
export function RequireRole({ role }: { role: Role }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={HOME_BY_ROLE[user.role]} replace />
  return <Outlet />
}
