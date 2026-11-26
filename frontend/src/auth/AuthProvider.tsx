import { useEffect, useState, type ReactNode } from 'react'
import { API_MODE, configureClient } from '../api/client'
import type { Role, User } from '../api/types'
import { AuthContext } from './useAuth'

const MOCK_KEY = 'mediconnect-mock-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (API_MODE === 'mock') {
      const saved = sessionStorage.getItem(MOCK_KEY)
      const u: User | null = saved ? JSON.parse(saved) : null
      import('../mock/server').then(({ setMockUser }) => {
        setMockUser(u)
        setUser(u)
        setReady(true)
      })
      return
    }
    let token: string | null = null
    import('./oidc').then(async ({ userManager, toAppUser }) => {
      configureClient({ token: () => token, unauthorized: () => userManager.signinRedirect() })
      userManager.events.addUserLoaded((u) => { token = u.access_token })
      try {
        const oidcUser = window.location.pathname === '/auth/callback'
          ? await userManager.signinRedirectCallback()
          : await userManager.getUser()
        if (oidcUser && !oidcUser.expired) {
          token = oidcUser.access_token
          setUser(toAppUser(oidcUser))
        }
        if (window.location.pathname === '/auth/callback') window.history.replaceState(null, '', '/')
      } finally {
        setReady(true)
      }
    })
  }, [])

  async function login(role?: Role) {
    if (API_MODE === 'mock') {
      const [{ DEMO_USERS }, { setMockUser }] = await Promise.all([import('../mock/data'), import('../mock/server')])
      const u = DEMO_USERS.find((d) => d.role === (role ?? 'PATIENT'))!
      sessionStorage.setItem(MOCK_KEY, JSON.stringify(u))
      setMockUser(u)
      setUser(u)
      return
    }
    const { userManager } = await import('./oidc')
    await userManager.signinRedirect()
  }

  async function logout() {
    if (API_MODE === 'mock') {
      sessionStorage.removeItem(MOCK_KEY)
      const { setMockUser } = await import('../mock/server')
      setMockUser(null)
      setUser(null)
      return
    }
    const { userManager } = await import('./oidc')
    await userManager.signoutRedirect()
  }

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>
}
