import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { User } from '../api/types'
import { RequireRole } from './RequireRole'
import { AuthContext } from './useAuth'

function renderAt(path: string, user: User | null) {
  const router = createMemoryRouter([
    { path: '/login', element: <p>login page</p> },
    { path: '/patient', element: <p>patient home</p> },
    { path: '/admin', element: <RequireRole role="HOSPITAL_ADMIN" />, children: [{ index: true, element: <p>admin home</p> }] },
  ], { initialEntries: [path] })
  render(
    <AuthContext.Provider value={{ user, ready: true, login: async () => {}, logout: async () => {} }}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
}

describe('RequireRole', () => {
  it('sends signed-out users to login', () => {
    renderAt('/admin', null)
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('sends the wrong role to its own home', () => {
    renderAt('/admin', { id: 'p1', name: 'P', email: 'p@x', role: 'PATIENT' })
    expect(screen.getByText('patient home')).toBeInTheDocument()
  })

  it('shows the page to the right role', () => {
    renderAt('/admin', { id: 'a1', name: 'A', email: 'a@x', role: 'HOSPITAL_ADMIN' })
    expect(screen.getByText('admin home')).toBeInTheDocument()
  })
})
