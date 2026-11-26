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

/** Maps a Keycloak user to the app user. The role comes from the realm roles in the access token. */
export function toAppUser(u: OidcUser): User {
  const payload = JSON.parse(atob(u.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  const roles: string[] = payload.realm_access?.roles ?? []
  const role = ROLES.find((r) => roles.includes(r)) ?? 'PATIENT'
  return { id: u.profile.sub, name: u.profile.name ?? u.profile.preferred_username ?? 'User', email: u.profile.email ?? '', role }
}
