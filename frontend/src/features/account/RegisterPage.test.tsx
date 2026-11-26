import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { RegisterPage } from './RegisterPage'

const setup = () => render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter><RegisterPage /></MemoryRouter>
  </QueryClientProvider>,
)

describe('RegisterPage', () => {
  it('shows field errors instead of submitting an invalid form', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Enter your full name')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('creates a pending doctor account', async () => {
    setup()
    await userEvent.click(screen.getByText('Doctor'))
    await userEvent.type(screen.getByLabelText('Full name'), 'Dr. Test Person')
    await userEvent.type(screen.getByLabelText('Email'), 'newdoc@example.com')
    await userEvent.type(screen.getByLabelText('Specialty'), 'Dermatology')
    await userEvent.type(screen.getByLabelText('Password'), 'secret123')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText(/pending/i)).toBeInTheDocument()
  })
})
