import { beforeEach, describe, expect, it } from 'vitest'
import type { Appointment, BloodRequest, DonorProfile } from '../api/types'
import { DEMO_USERS } from './data'
import { localDate } from '../lib/format'
import { mockFetch, resetMockDb, setMockUser } from './server'

const as = (role: string) => setMockUser(DEMO_USERS.find((u) => u.role === role)!)

describe('mock API business rules', () => {
  beforeEach(() => resetMockDb())

  it('prevents double booking of a doctor', async () => {
    as('PATIENT')
    const [slot] = await mockFetch<string[]>('GET', `/doctors/d3/slots?date=${tomorrow()}`)
    const body = { doctorId: 'd3', dateTime: slot, type: 'IN_PERSON', reason: 'Knee pain' }
    await mockFetch<Appointment>('POST', '/appointments', body)
    await expect(mockFetch('POST', '/appointments', body)).rejects.toMatchObject({ status: 409 })
  })

  it('blocks other roles from admin endpoints', async () => {
    as('DONOR')
    await expect(mockFetch('GET', '/admin/doctors')).rejects.toMatchObject({ status: 403 })
    setMockUser(null)
    await expect(mockFetch('GET', '/appointments')).rejects.toMatchObject({ status: 401 })
  })

  it('puts the donor in the recovery period after a confirmed donation', async () => {
    as('DONOR')
    await mockFetch('POST', '/donor/alerts/da1/respond', { response: 'ACCEPTED' })
    as('HOSPITAL_ADMIN')
    const req = await mockFetch<BloodRequest>('POST', '/admin/blood-requests/br1/confirm-donation')
    expect(req.status).toBe('FULFILLED')
    as('DONOR')
    const profile = await mockFetch<DonorProfile>('GET', '/donor/profile')
    expect(profile.active).toBe(false)
    await expect(mockFetch('PATCH', '/donor/profile', { active: true })).rejects.toMatchObject({ status: 409 })
  })

  it('never exposes donor locations in alerts', async () => {
    as('DONOR')
    const alerts = await mockFetch<object[]>('GET', '/donor/alerts')
    alerts.forEach((a) => expect(Object.keys(a)).not.toEqual(expect.arrayContaining(['latitude', 'longitude'])))
  })
})

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localDate(d)
}
