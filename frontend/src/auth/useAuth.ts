import { createContext, useContext } from 'react'
import type { Role, User } from '../api/types'

export type LoginInput = { username: string; password: string } | 'google'

export interface AuthState {
  user: User | null
  ready: boolean
  /** Signs in with email + password, or redirects to Google. Throws an Error with a user-facing message on failure. */
  login: (input: LoginInput) => Promise<void>
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
