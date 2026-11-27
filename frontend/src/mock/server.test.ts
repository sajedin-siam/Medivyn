// The API's business rules. By default they run against the in-browser mock.
// To check the real backend, seed it with mock/data.ts, expose POST /test/reset (test profile only), and run:
//   API_URL=http://localhost:8080/api API_TOKENS='{"p1":"<jwt>","p2":"…","d1":"…","d9":"…","n1":"…","a1":"…"}' npx vitest run src/mock/server.test.ts
// API_TOKENS maps each user id used below to an access token for that user.
import { beforeEach, describe, expect, it } from 'vitest'
import { ApiError } from '../api/errors'
import type { Appointment, Bill, BloodRequest, DonorProfile, User } from '../api/types'
import { DEMO_USERS } from './data'
import { localDate } from '../lib/format'
import { mockFetch, resetMockDb, setMockUser } from './server'

const LIVE = import.meta.env.API_URL as string | undefined
const TOKENS: Record<string, string> = JSON.parse(import.meta.env.API_TOKENS ?? '{}')
let current: User | null = null

function login(u: User | null) { current = u; setMockUser(u) }
const as = (role: string) => login(DEMO_USERS.find((u) => u.role === role)!)

async function call<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  if (!LIVE) return mockFetch<T>(method, path, body)
  const token = current && TOKENS[current.id]
  const res = await fetch(LIVE + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new ApiError(res.status, res.statusText)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

describe('API business rules', () => {
  beforeEach(async () => { if (LIVE) await fetch(`${LIVE}/test/reset`, { method: 'POST' }); else resetMockDb() })

  it('prevents double booking of a doctor', async () => {
    as('PATIENT')
    const [slot] = await call<string[]>('GET', `/doctors/d3/slots?date=${tomorrow()}`)
    const body = { doctorId: 'd3', dateTime: slot, type: 'IN_PERSON', reason: 'Knee pain' }
    await call<Appointment>('POST', '/appointments', body)
    await expect(call('POST', '/appointments', body)).rejects.toMatchObject({ status: 409 })
  })

  it('books only offered future times with approved doctors', async () => {
    as('PATIENT')
    const [slot] = await call<string[]>('GET', `/doctors/d3/slots?date=${tomorrow()}`)
    const base = { doctorId: 'd3', dateTime: slot, type: 'IN_PERSON', reason: 'Knee pain' }
    const odd = new Date(slot); odd.setMinutes(17)
    await expect(call('POST', '/appointments', { ...base, dateTime: odd.toISOString() })).rejects.toMatchObject({ status: 400 })
    await expect(call('POST', '/appointments', { ...base, dateTime: new Date(Date.now() - 86_400_000).toISOString() })).rejects.toMatchObject({ status: 400 })
    await expect(call('POST', '/appointments', { ...base, doctorId: 'd5' })).rejects.toMatchObject({ status: 404 })
  })

  it('blocks other roles from admin endpoints', async () => {
    as('DONOR')
    await expect(call('GET', '/admin/doctors')).rejects.toMatchObject({ status: 403 })
    login(null)
    await expect(call('GET', '/appointments')).rejects.toMatchObject({ status: 401 })
  })

  it('stops a patient from touching another patient’s bill, report or appointment', async () => {
    login({ id: 'p2', name: 'Kamal Uddin', email: 'kamal@demo.test', role: 'PATIENT' })
    await expect(call('POST', '/bills/b2/pay', { method: 'CARD' })).rejects.toMatchObject({ status: 403 })
    await expect(call('POST', '/reports/rep1/send', { hospitalId: 'h2' })).rejects.toMatchObject({ status: 403 })
    await expect(call('POST', '/appointments/ap1/cancel')).rejects.toMatchObject({ status: 403 })
    await expect(call('PUT', '/journal/j1', { sharedWith: [] })).rejects.toMatchObject({ status: 404 })
    login(null)
    await expect(call('POST', '/bills/b2/pay', { method: 'CARD' })).rejects.toMatchObject({ status: 401 })
  })

  it('leaves a cash bill unpaid until staff mark it paid', async () => {
    as('PATIENT')
    expect((await call<Bill>('POST', '/bills/b2/pay', { method: 'CASH' })).status).toBe('UNPAID')
    as('HOSPITAL_ADMIN')
    expect((await call<Bill>('POST', '/admin/bills/b2/mark-paid')).status).toBe('PAID')
  })

  it('lets an admin answer only pending referrals sent to their hospital', async () => {
    as('HOSPITAL_ADMIN')
    await expect(call('POST', '/referrals/rf1/respond', { status: 'ACCEPTED' })).rejects.toMatchObject({ status: 403 })
    await call('POST', '/referrals/rf2/respond', { status: 'ACCEPTED' })
    await expect(call('POST', '/referrals/rf2/respond', { status: 'DECLINED' })).rejects.toMatchObject({ status: 409 })
  })

  it('matches records and referrals by doctor id, not by name', async () => {
    login({ id: 'd9', name: 'Dr. Tanvir Hasan', email: 'other@demo.test', role: 'DOCTOR' })
    expect(await call('GET', '/records')).toEqual([])
    expect(await call('GET', '/referrals')).toEqual([])
  })

  it('counts a donor once and ignores answers to closed requests', async () => {
    as('DONOR')
    await call('POST', '/donor/alerts/da1/respond', { response: 'ACCEPTED' })
    await expect(call('POST', '/donor/alerts/da1/respond', { response: 'ACCEPTED' })).rejects.toMatchObject({ status: 409 })
    as('HOSPITAL_ADMIN')
    expect((await call<BloodRequest[]>('GET', '/blood-requests')).find((r) => r.id === 'br1')?.acceptedDonors).toBe(2)
  })

  it('puts the donor in the recovery period after a confirmed donation', async () => {
    as('DONOR')
    await call('POST', '/donor/alerts/da1/respond', { response: 'ACCEPTED' })
    as('HOSPITAL_ADMIN')
    const req = await call<BloodRequest>('POST', '/admin/blood-requests/br1/confirm-donation')
    expect(req.status).toBe('FULFILLED')
    as('DONOR')
    const profile = await call<DonorProfile>('GET', '/donor/profile')
    expect(profile.active).toBe(false)
    await expect(call('PATCH', '/donor/profile', { active: true })).rejects.toMatchObject({ status: 409 })
  })

  it('never exposes donor locations in alerts', async () => {
    as('DONOR')
    const alerts = await call<object[]>('GET', '/donor/alerts')
    alerts.forEach((a) => expect(Object.keys(a)).not.toEqual(expect.arrayContaining(['latitude', 'longitude'])))
  })
})

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localDate(d)
}
