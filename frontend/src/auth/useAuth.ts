import { createContext, useContext } from 'react'
import type { Role, User } from '../api/types'

export interface AuthState {
  user: User | null
  ready: boolean
  /** In mock mode the role picks a demo account; in live mode it redirects to Keycloak. */
  login: (role?: Role) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const HOME_BY_ROLE: Record<Role, string> = {
  PATIENT: '/patient',
  DOCTOR: '/doctor',
  DONOR: '/donor',
  HOSPITAL_ADMIN: '/admin',
}
