import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { HOME_BY_ROLE, useAuth } from '../../auth/useAuth'

/** "/" inside the app: signed-in users go to their portal, everyone else to the static landing page (index.html). */
export function LandingPage() {
  const { user, ready } = useAuth()
  const leave = ready && !user
  useEffect(() => { if (leave) window.location.replace('/') }, [leave])
  return user ? <Navigate to={HOME_BY_ROLE[user.role]} replace /> : null
}
