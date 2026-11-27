import { ApiError } from './errors'

export const API_MODE: 'mock' | 'live' = import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'mock'

export { ApiError }

let tokenProvider: () => string | null = () => null
let onUnauthorized: () => void = () => {}

/** Called once by AuthProvider so every request carries the current token. */
export function configureClient(opts: { token: () => string | null; unauthorized: () => void }) {
  tokenProvider = opts.token
  onUnauthorized = opts.unauthorized
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (API_MODE === 'mock') {
    // loaded lazily so live builds don't ship the demo data
    const { mockFetch } = await import('../mock/server')
    return mockFetch<T>(method, path, body)
  }

  const token = tokenProvider()
  const isForm = body instanceof FormData
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
  if (res.status === 401) onUnauthorized()
  if (!res.ok) {
    const msg = await res.json().then((j) => j.message as string, () => res.statusText)
    throw new ApiError(res.status, msg || 'Request failed')
  }
  // Spring's void handlers answer 200 with an empty body, not 204
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
}
