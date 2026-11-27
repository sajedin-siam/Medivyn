import { UserManager, WebStorageStateStore, type User as OidcUser } from 'oidc-client-ts'
import type { Role, User } from '../api/types'

const ROLES: Role[] = ['PATIENT', 'DOCTOR', 'DONOR', 'HOSPITAL_ADMIN']

export const userManager = new UserManager({
  authority: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8180/realms/mediconnect',
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'mediconnect-web',
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: window.location.origin,
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
})

/** Maps a Keycloak user to the app user, or null when the token has no app role yet (e.g. a doctor awaiting approval). */
export function toAppUser(u: OidcUser): User | null {
  const payload = JSON.parse(atob(u.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  const roles: string[] = payload.realm_access?.roles ?? []
  const role = ROLES.find((r) => roles.includes(r))
  if (!role) return null
  return { id: u.profile.sub, name: u.profile.name ?? u.profile.preferred_username ?? 'User', email: u.profile.email ?? '', role }
}
