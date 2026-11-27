import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { API_MODE, configureClient } from '../api/client'
import type { User } from '../api/types'
import { AuthContext, type LoginInput } from './useAuth'

const MOCK_KEY = 'mediconnect-mock-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const queryClient = useQueryClient()

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
          const appUser = toAppUser(oidcUser)
          if (!appUser) toast.error('Your account has no access yet. If you registered as a doctor, a hospital admin must approve you first.')
          setUser(appUser)
        }
        if (window.location.pathname === '/auth/callback') window.history.replaceState(null, '', '/')
      } catch {
        // e.g. the callback page was reloaded and its one-time login state is gone: start over at sign-in
        window.history.replaceState(null, '', '/login')
      } finally {
        setReady(true)
      }
    })
  }, [])

  async function login(input: LoginInput) {
    if (API_MODE === 'mock') {
      const [{ DEMO_USERS, DEMO_PASSWORD }, { setMockUser }] = await Promise.all([import('../mock/data'), import('../mock/server')])
      const u = input === 'google'
        ? DEMO_USERS[0]
        : DEMO_USERS.find((d) => d.email === input.username.trim().toLowerCase() && input.password === DEMO_PASSWORD)
      if (!u) throw new Error('Wrong email or password')
      sessionStorage.setItem(MOCK_KEY, JSON.stringify(u))
      setMockUser(u)
      setUser(u)
      return
    }
    const { userManager, toAppUser } = await import('./oidc')
    // Keycloak skips its own login page and goes straight to the Google identity provider
    if (input === 'google') return userManager.signinRedirect({ extraQueryParams: { kc_idp_hint: 'google' } })
    try {
      const oidcUser = await userManager.signinResourceOwnerCredentials(input)
      const appUser = toAppUser(oidcUser)
      if (!appUser) throw new Error('Your account has no access yet. If you registered as a doctor, a hospital admin must approve you first.')
      setUser(appUser)
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Your account')) throw e
      throw new Error('Wrong email or password')
    }
  }

  async function logout() {
    // the next user must not see this user's cached data
    queryClient.clear()
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
