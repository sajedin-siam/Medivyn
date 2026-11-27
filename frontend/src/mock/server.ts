// In-browser fake of the Spring Boot REST API, used when VITE_API_MODE=mock.
// The route table doubles as the API contract the Java backend must implement.
import type {
  AdminSummary, Appointment, Bill, BloodRequest, ChatMessage, Hospital, JournalEntry, MedicalReport,
  PaymentMethod, Referral, ReferralStatus, RegisterRequest, User,
} from '../api/types'
import { ApiError } from '../api/errors'
import { localDate } from '../lib/format'
import { seed, type MockDb } from './data'

// bump the version whenever seed() changes shape, so saved demo data from an older build is dropped
const STORE_KEY = 'mediconnect-mock-db-v2'
const ADMIN_HOSPITAL = 'h1'

let db: MockDb = load()
let me: User | null = null

function load(): MockDb {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORE_KEY) : null
    if (raw) return JSON.parse(raw)
  } catch { /* corrupt store: fall back to seed */ }
  return seed()
}
function save() {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORE_KEY, JSON.stringify(db))
}

export function setMockUser(user: User | null) { me = user }
export function resetMockDb() { db = seed(); save() }

const fail = (status: number, msg: string): never => { throw new ApiError(status, msg) }
const id = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
const now = () => new Date().toISOString()
const user = () => me ?? fail(401, 'Not signed in')
const requireRole = (...roles: User['role'][]) => { const u = user(); if (!roles.includes(u.role)) fail(403, 'Forbidden'); return u }

function notify(userId: string, text: string) {
  (db.notifications[userId] ??= []).unshift({ id: id('nt'), text, createdAt: now(), read: false })
}
function audit(action: string, target: string) {
  db.audit.unshift({ id: id('au'), actor: user().name, action, target, at: now() })
}

/** The doctor's bookable times on a local date: fixed hours, not taken, not in the past. */
function freeSlots(doctorId: string, date: string) {
  const taken = new Set(db.appointments.filter((a) => a.doctorId === doctorId && a.status !== 'CANCELLED').map((a) => a.dateTime))
  return [9, 10, 11, 12, 14, 15, 16, 17].map((h) => new Date(`${date}T${String(h).padStart(2, '0')}:00:00`).toISOString())
    .filter((t) => !taken.has(t) && new Date(t) > new Date())
}

type Handler = (p: Record<string, string>, body: any, q: URLSearchParams) => unknown
const routes: [string, string, Handler][] = [
  // Accounts
  ['GET', '/me', () => user()],
  ['POST', '/accounts/register', (_p, b: RegisterRequest) => {
    if (db.users.some((u) => u.email === b.email)) fail(409, 'An account with this email already exists')
    const u: User = { id: id('u'), name: b.name, email: b.email, role: b.role }
    db.users.push(u)
    if (b.role === 'DOCTOR') {
      db.doctors.push({ id: u.id, name: b.name, specialty: b.specialty ?? 'General', department: b.specialty ?? 'General', hospital: 'MediConnect General Hospital', fee: 1000, status: 'PENDING' })
      notify('a1', `${b.name} registered as a doctor and is waiting for approval.`)
    }
    return { ...u, pending: b.role === 'DOCTOR' }
  }],

  // Doctors and appointments
  ['GET', '/doctors', (_p, _b, q) => {
    const term = (q.get('q') ?? '').toLowerCase()
    return db.doctors.filter((d) => d.status === 'APPROVED' &&
      [d.name, d.specialty, d.department].some((s) => s.toLowerCase().includes(term)))
  }],
  ['GET', '/doctors/:id/slots', (p, _b, q) => freeSlots(p.id, q.get('date') ?? localDate())],
  ['GET', '/my-doctors', () => {
    const u = requireRole('PATIENT')
    const ids = new Set(db.appointments.filter((a) => a.patientId === u.id).map((a) => a.doctorId))
    return db.doctors.filter((d) => ids.has(d.id))
  }],
  ['GET', '/appointments', () => {
    const u = user()
    return db.appointments.filter((a) => (u.role === 'PATIENT' ? a.patientId : a.doctorId) === u.id)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  }],
  ['POST', '/appointments', (_p, b) => {
    const u = requireRole('PATIENT')
    const doc = db.doctors.find((d) => d.id === b.doctorId && d.status === 'APPROVED') ?? fail(404, 'Doctor not found')
    if (b.type !== 'IN_PERSON' && b.type !== 'ONLINE') fail(400, 'Choose in person or online')
    if (!b.reason?.trim()) fail(400, 'Enter the reason for the visit')
    if (db.appointments.some((a) => a.doctorId === doc.id && a.dateTime === b.dateTime && a.status !== 'CANCELLED'))
      fail(409, 'This time slot was just booked. Please choose another.')
    if (!freeSlots(doc.id, localDate(new Date(b.dateTime))).includes(b.dateTime)) fail(400, 'Choose one of the offered times')
    const appt: Appointment = {
      id: id('ap'), patientId: u.id, patientName: u.name, doctorId: doc.id, doctorName: doc.name, specialty: doc.specialty,
      dateTime: b.dateTime, type: b.type, reason: b.reason, status: 'BOOKED',
      meetingLink: b.type === 'ONLINE' ? `https://meet.jit.si/mediconnect-${Date.now().toString(36)}` : undefined,
    }
    db.appointments.push(appt)
    notify(doc.id, `New appointment from ${u.name}.`)
    return appt
  }],
  ['POST', '/appointments/:id/cancel', (p) => {
    const u = requireRole('PATIENT')
    const a = db.appointments.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    if (a.patientId !== u.id) fail(403, 'Forbidden')
    if (a.status !== 'BOOKED') fail(409, 'Only booked appointments can be cancelled')
    a.status = 'CANCELLED'
    return a
  }],

  // Clinical
  ['GET', '/records', () => {
    const u = user()
    return db.records.filter((r) => u.role === 'PATIENT' ? r.patientId === u.id : r.doctorId === u.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  }],
  ['GET', '/patients/:id/records', (p) => {
    const u = requireRole('DOCTOR')
    if (!db.appointments.some((a) => a.doctorId === u.id && a.patientId === p.id)) fail(403, 'Not your patient')
    return db.records.filter((r) => r.patientId === p.id)
  }],
  ['POST', '/appointments/:id/record', (p, b) => {
    const u = requireRole('DOCTOR')
    const a = db.appointments.find((x) => x.id === p.id && x.doctorId === u.id) ?? fail(404, 'Not found')
    a.status = 'COMPLETED'
    const rec = { id: id('r'), patientId: a.patientId, patientName: a.patientName, doctorId: u.id, doctorName: u.name, date: now(), ...b }
    db.records.push(rec)
    notify(a.patientId, `${u.name} added a diagnosis and prescription to your history.`)
    audit('Recorded diagnosis', `${a.patientName}`)
    return rec
  }],

  // Billing
  ['GET', '/bills', () => {
    const u = user()
    return db.bills.filter((b) => u.role === 'HOSPITAL_ADMIN' || b.patientId === u.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }],
  ['GET', '/admin/patients', () => { requireRole('HOSPITAL_ADMIN'); return db.users.filter((u) => u.role === 'PATIENT') }],
  ['POST', '/admin/bills', (_p, b) => {
    requireRole('HOSPITAL_ADMIN')
    const patient = db.users.find((u) => u.id === b.patientId) ?? fail(404, 'Patient not found')
    const bill: Bill = { id: id('b'), patientId: patient.id, patientName: patient.name, description: b.description, amount: b.amount, status: 'UNPAID', createdAt: now() }
    db.bills.push(bill)
    notify(patient.id, `New bill: ${b.description} (৳${b.amount}).`)
    audit('Created bill', `${bill.description} (${patient.name})`)
    return bill
  }],
  ['POST', '/bills/:id/pay', (p, b: { method: PaymentMethod }) => {
    const u = requireRole('PATIENT')
    const bill = db.bills.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    if (bill.patientId !== u.id) fail(403, 'Forbidden')
    if (bill.status === 'PAID') fail(409, 'This bill is already paid')
    // cash is paid at the counter; staff mark it paid through /admin/bills/:id/mark-paid
    if (b.method === 'CASH') return bill
    // mock: stands in for the gateway's confirmation. The real endpoint returns redirectUrl
    // and marks the bill PAID only when SSLCommerz or bKash confirms the payment.
    bill.status = 'PAID'; bill.paidWith = b.method
    audit('Paid bill', bill.description)
    return bill
  }],
  ['POST', '/admin/bills/:id/mark-paid', (p) => {
    requireRole('HOSPITAL_ADMIN')
    const bill = db.bills.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    if (bill.status === 'PAID') fail(409, 'This bill is already paid')
    bill.status = 'PAID'; bill.paidWith = 'CASH'
    audit('Marked bill paid (cash)', `${bill.description} (${bill.patientName})`)
    return bill
  }],

  // Reports
  ['GET', '/reports', () => db.reports.filter((r) => r.patientId === user().id).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))],
  ['POST', '/reports', (_p, b: FormData) => {
    const u = requireRole('PATIENT')
    const file = b.get('file') as File
    const rep: MedicalReport = {
      id: id('rep'), patientId: u.id, fileName: file.name, fileType: file.type, uploadedAt: now(), sentTo: [],
      // mock: PDFs get a summary, images simulate the AI service being unavailable
      aiSummary: file.type === 'application/pdf' ? 'Values are mostly within normal ranges. One marker is slightly elevated; discuss with your doctor.' : null,
    }
    db.reports.push(rep)
    return rep
  }],
  ['POST', '/reports/:id/send', (p, b) => {
    const u = requireRole('PATIENT')
    const rep = db.reports.find((r) => r.id === p.id) ?? fail(404, 'Not found')
    if (rep.patientId !== u.id) fail(403, 'Forbidden')
    const h = db.hospitals.find((x) => x.id === b.hospitalId) ?? fail(404, 'Hospital not found')
    if (!rep.sentTo.includes(h.name)) rep.sentTo.push(h.name)
    return rep
  }],

  // Hospitals and referrals
  ['GET', '/hospitals', (_p, _b, q) => {
    const service = q.get('service') ?? ''
    return db.hospitals.filter((h) => !service || h.services.includes(service)).sort((a, b) => a.distanceKm - b.distanceKm)
  }],
  ['GET', '/referrals', () => {
    const u = requireRole('DOCTOR', 'HOSPITAL_ADMIN')
    return db.referrals.filter((r) => u.role === 'DOCTOR' ? r.fromDoctorId === u.id : r.hospitalId === ADMIN_HOSPITAL)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }],
  ['POST', '/referrals', (_p, b) => {
    const u = requireRole('DOCTOR')
    const h = db.hospitals.find((x) => x.id === b.hospitalId) ?? fail(404, 'Hospital not found')
    if (!h.acceptsReferrals) fail(409, `${h.name} is not accepting referrals`)
    const patient = db.users.find((x) => x.id === b.patientId) ?? fail(404, 'Patient not found')
    const ref: Referral = { id: id('rf'), patientId: patient.id, patientName: patient.name, fromDoctorId: u.id, fromDoctor: u.name, hospitalId: h.id, hospitalName: h.name, service: b.service, reason: b.reason, status: 'PENDING', createdAt: now() }
    db.referrals.push(ref)
    return ref
  }],
  ['POST', '/referrals/:id/respond', (p, b: { status: ReferralStatus; note?: string }) => {
    requireRole('HOSPITAL_ADMIN')
    const ref = db.referrals.find((r) => r.id === p.id) ?? fail(404, 'Not found')
    if (ref.hospitalId !== ADMIN_HOSPITAL) fail(403, 'This referral was sent to another hospital')
    if (ref.status !== 'PENDING') fail(409, 'This referral has already been answered')
    if (!['ACCEPTED', 'DECLINED', 'MORE_INFO_NEEDED'].includes(b.status)) fail(400, 'Invalid status')
    ref.status = b.status; ref.responseNote = b.note
    if (b.status === 'ACCEPTED') {
      const h = db.hospitals.find((x) => x.id === ref.hospitalId)!
      db.reports.filter((r) => r.patientId === ref.patientId).forEach((r) => { if (!r.sentTo.includes(h.name)) r.sentTo.push(h.name) })
    }
    notify(ref.fromDoctorId, `${ref.hospitalName} responded to the referral for ${ref.patientName}: ${b.status.replaceAll('_', ' ').toLowerCase()}.`)
    audit(`Referral ${b.status.toLowerCase()}`, ref.patientName)
    return ref
  }],
  ['GET', '/referrals/:id/alternatives', (p) => {
    requireRole('DOCTOR')
    const ref = db.referrals.find((r) => r.id === p.id) ?? fail(404, 'Not found')
    const rank = { AVAILABLE: 0, LIMITED: 1, UNCONFIRMED: 2 }
    return db.hospitals.filter((h) => h.id !== ref.hospitalId && h.acceptsReferrals && h.services.includes(ref.service))
      .sort((a, b) => rank[a.capacity] - rank[b.capacity] || a.distanceKm - b.distanceKm)
  }],
  ['GET', '/admin/hospital', () => { requireRole('HOSPITAL_ADMIN'); return db.hospitals.find((h) => h.id === ADMIN_HOSPITAL) }],
  ['PUT', '/admin/hospital', (_p, b: Partial<Hospital>) => {
    requireRole('HOSPITAL_ADMIN')
    const h = db.hospitals.find((x) => x.id === ADMIN_HOSPITAL)!
    Object.assign(h, { services: b.services, capacity: b.capacity, acceptsReferrals: b.acceptsReferrals })
    audit('Updated hospital services and capacity', h.name)
    return h
  }],

  // Blood donor finder
  ['GET', '/blood-requests', () => {
    const u = requireRole('PATIENT', 'HOSPITAL_ADMIN')
    return db.bloodRequests.filter((r) => u.role === 'HOSPITAL_ADMIN' || r.requesterId === u.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }],
  ['POST', '/blood-requests', (_p, b) => {
    const u = requireRole('PATIENT', 'HOSPITAL_ADMIN')
    const req: BloodRequest = { id: id('br'), requesterId: u.id, requesterName: u.role === 'HOSPITAL_ADMIN' ? `${u.name} (admin)` : u.name, ...b, status: 'OPEN', notifiedDonors: 5, acceptedDonors: 0, remindersSent: 0, createdAt: now() }
    db.bloodRequests.push(req)
    if (b.bloodGroup === db.donorProfile.bloodGroup && db.donorProfile.active) {
      db.donorAlerts.unshift({ id: id('da'), requestId: req.id, bloodGroup: req.bloodGroup, units: req.units, hospital: req.hospital, area: req.area, urgent: req.urgent, response: 'PENDING', createdAt: now() })
      notify('n1', `${req.urgent ? 'Urgent: ' : ''}${req.bloodGroup} blood needed at ${req.hospital}.`)
    }
    return req
  }],
  ['POST', '/blood-requests/:id/cancel', (p) => {
    const u = requireRole('PATIENT', 'HOSPITAL_ADMIN')
    const r = db.bloodRequests.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    if (u.role !== 'HOSPITAL_ADMIN' && r.requesterId !== u.id) fail(403, 'Forbidden')
    if (r.status !== 'OPEN') fail(409, 'This request is no longer open')
    r.status = 'CANCELLED'
    return r
  }],
  ['POST', '/admin/blood-requests/:id/confirm-donation', (p) => {
    requireRole('HOSPITAL_ADMIN')
    const r = db.bloodRequests.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    if (r.acceptedDonors === 0) fail(409, 'No donor has accepted this request yet')
    r.status = 'FULFILLED'
    if (db.donorAlerts.some((a) => a.requestId === r.id && a.response === 'ACCEPTED')) {
      const until = new Date(); until.setDate(until.getDate() + 90)
      Object.assign(db.donorProfile, { active: false, lastDonation: now(), eligibleFrom: until.toISOString() })
      notify('n1', 'Thank you for donating! You are inactive until your recovery period ends.')
    }
    audit('Confirmed donation', `${r.bloodGroup} request ${r.id}`)
    return r
  }],
  ['GET', '/donor/profile', () => { requireRole('DONOR'); return db.donorProfile }],
  ['PATCH', '/donor/profile', (_p, b: { active: boolean }) => {
    requireRole('DONOR')
    const p = db.donorProfile
    if (b.active && p.eligibleFrom && new Date(p.eligibleFrom) > new Date()) fail(409, 'You are still in your recovery period')
    p.active = b.active
    return p
  }],
  ['GET', '/donor/alerts', () => { requireRole('DONOR'); return db.donorAlerts }],
  ['POST', '/donor/alerts/:id/respond', (p, b: { response: 'ACCEPTED' | 'DECLINED' }) => {
    requireRole('DONOR')
    const a = db.donorAlerts.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    if (a.response !== 'PENDING') fail(409, 'You have already answered this request')
    const req = db.bloodRequests.find((r) => r.id === a.requestId)
    if (req && req.status !== 'OPEN') fail(409, 'This request is no longer open')
    a.response = b.response
    if (req && b.response === 'ACCEPTED') {
      req.acceptedDonors++
      notify(req.requesterId, `A donor accepted your ${req.bloodGroup} blood request. Reminders have stopped.`)
    }
    return a
  }],

  // Wellbeing
  ['GET', '/journal', () => { const u = requireRole('PATIENT'); return db.journal.filter((e) => e.patientId === u.id).sort((a, b) => b.date.localeCompare(a.date)) }],
  ['POST', '/journal', (_p, b) => {
    const u = requireRole('PATIENT')
    const e: JournalEntry = { id: id('j'), patientId: u.id, date: now(), sharedWith: [], mood: b.mood, text: b.text }
    db.journal.push(e)
    return e
  }],
  ['PUT', '/journal/:id', (p, b: Pick<JournalEntry, 'sharedWith'>) => {
    const u = requireRole('PATIENT')
    const e = db.journal.find((x) => x.id === p.id && x.patientId === u.id) ?? fail(404, 'Not found')
    e.sharedWith = b.sharedWith
    return e
  }],
  ['DELETE', '/journal/:id', (p) => {
    const u = requireRole('PATIENT')
    db.journal = db.journal.filter((x) => !(x.id === p.id && x.patientId === u.id))
  }],
  ['GET', '/doctor/shared-journal', () => {
    const u = requireRole('DOCTOR')
    // demo: Dr. Tanvir also sees entries shared with the psychiatrist so the chart has data
    return db.journal.filter((e) => e.sharedWith.includes(u.id) || e.sharedWith.includes('d2'))
      .map((e) => ({ id: e.id, patientId: e.patientId, patientName: db.users.find((x) => x.id === e.patientId)?.name ?? '', date: e.date, mood: e.mood, text: e.text }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }],
  ['POST', '/chat', (_p, b: { messages: ChatMessage[] }): ChatMessage => {
    requireRole('PATIENT')
    const last = b.messages.at(-1)?.text.toLowerCase() ?? ''
    if (/suicid|kill myself|end my life|self.?harm|hurt myself|no reason to live|hopeless/.test(last))
      return { role: 'assistant', distress: true, text: 'I am really sorry you are feeling this way. You deserve support right now. Please contact your doctor or a mental health helpline, or call 999 if you are in immediate danger. Would you like me to help you book an online session with a mental health doctor?' }
    if (/sleep|insomnia/.test(last))
      return { role: 'assistant', text: 'Trouble sleeping is common during stressful times. A fixed bedtime, less screen time in the last hour and avoiding caffeine after noon often help. If it lasts more than a few weeks, it is worth mentioning to your doctor.' }
    if (/stress|anxious|anxiety|worried/.test(last))
      return { role: 'assistant', text: 'That sounds stressful. Slow breathing (in for 4, hold for 4, out for 6) can calm the body quickly. Writing down what is worrying you in your journal can also help. Do you want to talk about what is on your mind?' }
    return { role: 'assistant', text: 'Thank you for sharing. I am here to listen. How has your mood been over the last few days?' }
  }],

  // Notifications
  ['GET', '/notifications', () => db.notifications[user().id] ?? []],
  ['POST', '/notifications/read-all', () => { (db.notifications[user().id] ?? []).forEach((n) => (n.read = true)) }],

  // Administration
  ['GET', '/admin/doctors', () => { requireRole('HOSPITAL_ADMIN'); return db.doctors }],
  ['POST', '/admin/doctors/:id/approve', (p) => {
    requireRole('HOSPITAL_ADMIN')
    const d = db.doctors.find((x) => x.id === p.id) ?? fail(404, 'Not found')
    d.status = 'APPROVED'
    audit('Approved doctor', d.name)
    return d
  }],
  ['DELETE', '/admin/doctors/:id', (p) => {
    requireRole('HOSPITAL_ADMIN')
    const d = db.doctors.find((x) => x.id === p.id)
    db.doctors = db.doctors.filter((x) => x.id !== p.id)
    if (d) audit('Removed doctor', d.name)
  }],
  ['GET', '/admin/departments', () => {
    requireRole('HOSPITAL_ADMIN')
    return db.departments.map((dep) => ({ ...dep, doctorCount: db.doctors.filter((d) => d.department === dep.name && d.status === 'APPROVED').length }))
  }],
  ['POST', '/admin/departments', (_p, b) => {
    requireRole('HOSPITAL_ADMIN')
    if (db.departments.some((d) => d.name.toLowerCase() === b.name.toLowerCase())) fail(409, 'Department already exists')
    const dep = { id: id('dep'), name: b.name, doctorCount: 0 }
    db.departments.push(dep)
    audit('Created department', dep.name)
    return dep
  }],
  ['DELETE', '/admin/departments/:id', (p) => { requireRole('HOSPITAL_ADMIN'); db.departments = db.departments.filter((d) => d.id !== p.id) }],
  ['GET', '/admin/summary', (): AdminSummary => {
    requireRole('HOSPITAL_ADMIN')
    const referrals = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, MORE_INFO_NEEDED: 0 }
    // same set as the incoming-referrals list
    db.referrals.filter((r) => r.hospitalId === ADMIN_HOSPITAL).forEach((r) => referrals[r.status]++)
    const appts = db.appointments.filter((a) => a.status !== 'CANCELLED')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    // four 7-day buckets: the three weeks before today, then today and the six days after it
    const appointmentsByWeek = [-21, -14, -7, 0].map((offset) => {
      const from = new Date(today); from.setDate(from.getDate() + offset)
      const to = new Date(from); to.setDate(to.getDate() + 7)
      return {
        week: offset === 0 ? 'This week' : from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        count: appts.filter((a) => new Date(a.dateTime) >= from && new Date(a.dateTime) < to).length,
      }
    })
    const sum = (status: Bill['status']) => db.bills.filter((b) => b.status === status).reduce((s, b) => s + b.amount, 0)
    return {
      appointmentsThisMonth: appts.filter((a) => {
        const d = new Date(a.dateTime)
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
      }).length,
      revenuePaid: sum('PAID'),
      revenueUnpaid: sum('UNPAID'),
      pendingDoctors: db.doctors.filter((d) => d.status === 'PENDING').length,
      referrals,
      openBloodRequests: db.bloodRequests.filter((r) => r.status === 'OPEN').length,
      appointmentsByWeek,
    }
  }],
  ['GET', '/admin/audit', () => { requireRole('HOSPITAL_ADMIN'); return db.audit }],
]

const compiled = routes.map(([method, pattern, handler]) => {
  const keys: string[] = []
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_m, k) => { keys.push(k); return '([^/]+)' }) + '$')
  return { method, re, keys, handler }
})

export async function mockFetch<T>(method: string, fullPath: string, body?: unknown): Promise<T> {
  await new Promise((r) => setTimeout(r, import.meta.env.MODE === 'test' ? 0 : 250))
  const [path, query = ''] = fullPath.split('?')
  for (const r of compiled) {
    const m = r.method === method && path.match(r.re)
    if (!m) continue
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]))
    const result = r.handler(params, body, new URLSearchParams(query))
    save()
    return structuredClone(result) as T
  }
  throw new Error(`Mock API: no route for ${method} ${path}`)
}
