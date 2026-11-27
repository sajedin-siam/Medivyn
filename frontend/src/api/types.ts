// TypeScript mirrors of the backend DTOs. Keep in sync with the Java `dto` classes.

export type Role = 'PATIENT' | 'DOCTOR' | 'DONOR' | 'HOSPITAL_ADMIN'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export interface Doctor {
  id: string
  name: string
  specialty: string
  department: string
  hospital: string
  fee: number
  status: 'PENDING' | 'APPROVED'
}

export type AppointmentType = 'IN_PERSON' | 'ONLINE'
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  specialty: string
  dateTime: string // ISO
  type: AppointmentType
  meetingLink?: string
  reason: string
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED'
}

export interface Prescription {
  medicine: string
  dosage: string
  duration: string
}
export interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  date: string
  diagnosis: string
  notes: string
  prescriptions: Prescription[]
}

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE'
export interface Bill {
  id: string
  patientId: string
  patientName: string
  description: string
  amount: number
  status: 'UNPAID' | 'PAID'
  createdAt: string
  paidWith?: PaymentMethod
}

export interface MedicalReport {
  id: string
  patientId: string
  fileName: string
  fileType: string
  uploadedAt: string
  aiSummary: string | null // null when the AI service was unavailable
  sentTo: string[]
}

export type Capacity = 'AVAILABLE' | 'LIMITED' | 'UNCONFIRMED'
export interface Hospital {
  id: string
  name: string
  area: string
  distanceKm: number
  services: string[]
  capacity: Capacity
  acceptsReferrals: boolean
}

export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MORE_INFO_NEEDED'
export interface Referral {
  id: string
  patientId: string
  patientName: string
  fromDoctor: string
  hospitalId: string
  hospitalName: string
  service: string
  reason: string
  status: ReferralStatus
  responseNote?: string
  createdAt: string
}

export interface BloodRequest {
  id: string
  requesterName: string
  bloodGroup: BloodGroup
  units: number
  hospital: string
  area: string
  urgent: boolean
  status: 'OPEN' | 'FULFILLED' | 'CANCELLED'
  notifiedDonors: number
  acceptedDonors: number
  remindersSent: number
  createdAt: string
}

// What a donor sees. Never includes other donors' locations.
export interface DonorAlert {
  id: string
  requestId: string
  bloodGroup: BloodGroup
  units: number
  hospital: string
  area: string
  urgent: boolean
  response: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
}

export interface DonorProfile {
  bloodGroup: BloodGroup
  active: boolean
  lastDonation: string | null
  eligibleFrom: string | null // set while in the recovery period
}

export interface JournalEntry {
  id: string
  patientId: string
  date: string
  mood: 1 | 2 | 3 | 4 | 5
  text: string
  sharedWith: string[] // doctor ids
}

export interface SharedJournalEntry {
  id: string
  patientId: string
  patientName: string
  date: string
  mood: JournalEntry['mood']
  text: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  distress?: boolean
}

export interface AppNotification {
  id: string
  text: string
  createdAt: string
  read: boolean
}

export interface Department {
  id: string
  name: string
  doctorCount: number
}

export interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  at: string
}

export interface AdminSummary {
  appointmentsThisMonth: number
  revenuePaid: number
  revenueUnpaid: number
  pendingDoctors: number
  referrals: Record<ReferralStatus, number>
  openBloodRequests: number
  appointmentsByWeek: { week: string; count: number }[]
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: Role
  bloodGroup?: BloodGroup
  specialty?: string
}
