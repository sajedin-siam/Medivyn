import type {
  Appointment, AppNotification, AuditEntry, Bill, BloodRequest, Department, Doctor, DonorAlert,
  DonorProfile, Hospital, JournalEntry, MedicalRecord, MedicalReport, Referral, User,
} from '../api/types'

// Demo data for mock mode. All names and places are fictional.
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
const day = (offset: number, hour = 10) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const DEMO_USERS: User[] = [
  { id: 'p1', name: 'Ayesha Rahman', email: 'patient@demo.test', role: 'PATIENT' },
  { id: 'd1', name: 'Dr. Tanvir Hasan', email: 'doctor@demo.test', role: 'DOCTOR' },
  { id: 'n1', name: 'Rafiq Islam', email: 'donor@demo.test', role: 'DONOR' },
  { id: 'a1', name: 'Nusrat Jahan', email: 'admin@demo.test', role: 'HOSPITAL_ADMIN' },
]

export function seed() {
  const users: User[] = [
    ...DEMO_USERS,
    { id: 'p2', name: 'Kamal Uddin', email: 'kamal@demo.test', role: 'PATIENT' },
    { id: 'p3', name: 'Sadia Akter', email: 'sadia@demo.test', role: 'PATIENT' },
  ]

  const doctors: Doctor[] = [
    { id: 'd1', name: 'Dr. Tanvir Hasan', specialty: 'Cardiology', department: 'Cardiology', hospital: 'MediConnect General Hospital', fee: 1000, status: 'APPROVED' },
    { id: 'd2', name: 'Dr. Farhana Kabir', specialty: 'Psychiatry', department: 'Mental Health', hospital: 'MediConnect General Hospital', fee: 1200, status: 'APPROVED' },
    { id: 'd3', name: 'Dr. Arif Chowdhury', specialty: 'Orthopedics', department: 'Orthopedics', hospital: 'MediConnect General Hospital', fee: 900, status: 'APPROVED' },
    { id: 'd4', name: 'Dr. Mehnaz Sultana', specialty: 'Pediatrics', department: 'Pediatrics', hospital: 'MediConnect General Hospital', fee: 800, status: 'APPROVED' },
    { id: 'd5', name: 'Dr. Imran Hossain', specialty: 'Neurology', department: 'Neurology', hospital: 'MediConnect General Hospital', fee: 1100, status: 'PENDING' },
  ]

  const departments: Department[] = [
    { id: 'dep1', name: 'Cardiology', doctorCount: 1 },
    { id: 'dep2', name: 'Mental Health', doctorCount: 1 },
    { id: 'dep3', name: 'Orthopedics', doctorCount: 1 },
    { id: 'dep4', name: 'Pediatrics', doctorCount: 1 },
    { id: 'dep5', name: 'Neurology', doctorCount: 0 },
  ]

  const appointments: Appointment[] = [
    { id: 'ap1', patientId: 'p1', patientName: 'Ayesha Rahman', doctorId: 'd1', doctorName: 'Dr. Tanvir Hasan', specialty: 'Cardiology', dateTime: day(2, 11), type: 'IN_PERSON', reason: 'Chest discomfort after exercise', status: 'BOOKED' },
    { id: 'ap2', patientId: 'p1', patientName: 'Ayesha Rahman', doctorId: 'd2', doctorName: 'Dr. Farhana Kabir', specialty: 'Psychiatry', dateTime: day(4, 16), type: 'ONLINE', meetingLink: 'https://meet.jit.si/mediconnect-ap2', reason: 'Follow-up on sleep and stress', status: 'BOOKED' },
    { id: 'ap3', patientId: 'p1', patientName: 'Ayesha Rahman', doctorId: 'd1', doctorName: 'Dr. Tanvir Hasan', specialty: 'Cardiology', dateTime: day(-20, 10), type: 'IN_PERSON', reason: 'Palpitations', status: 'COMPLETED' },
    { id: 'ap4', patientId: 'p2', patientName: 'Kamal Uddin', doctorId: 'd1', doctorName: 'Dr. Tanvir Hasan', specialty: 'Cardiology', dateTime: day(0, 15), type: 'IN_PERSON', reason: 'High blood pressure review', status: 'BOOKED' },
    { id: 'ap5', patientId: 'p3', patientName: 'Sadia Akter', doctorId: 'd1', doctorName: 'Dr. Tanvir Hasan', specialty: 'Cardiology', dateTime: day(1, 12), type: 'ONLINE', meetingLink: 'https://meet.jit.si/mediconnect-ap5', reason: 'ECG results discussion', status: 'BOOKED' },
  ]

  const records: MedicalRecord[] = [
    { id: 'r1', patientId: 'p1', patientName: 'Ayesha Rahman', doctorName: 'Dr. Tanvir Hasan', date: day(-20, 10), diagnosis: 'Benign palpitations, likely stress related', notes: 'Reduce caffeine. Review in 3 months if symptoms persist.', prescriptions: [{ medicine: 'Propranolol 10 mg', dosage: '1 tablet when needed', duration: '30 days' }] },
  ]

  const bills: Bill[] = [
    { id: 'b1', patientId: 'p1', patientName: 'Ayesha Rahman', description: 'Cardiology consultation', amount: 1000, status: 'PAID', createdAt: day(-20), paidWith: 'MOBILE' },
    { id: 'b2', patientId: 'p1', patientName: 'Ayesha Rahman', description: 'ECG test', amount: 600, status: 'UNPAID', createdAt: day(-19) },
    { id: 'b3', patientId: 'p2', patientName: 'Kamal Uddin', description: 'Cardiology consultation', amount: 1000, status: 'UNPAID', createdAt: day(-2) },
  ]

  const reports: MedicalReport[] = [
    { id: 'rep1', patientId: 'p1', fileName: 'ecg-report.pdf', fileType: 'application/pdf', uploadedAt: day(-19), aiSummary: 'Sinus rhythm with occasional premature beats. No signs of ischemia. Heart rate within normal range.', sentTo: [] },
    { id: 'rep2', patientId: 'p1', fileName: 'blood-test.jpg', fileType: 'image/jpeg', uploadedAt: day(-30), aiSummary: null, sentTo: [] },
  ]

  const hospitals: Hospital[] = [
    { id: 'h1', name: 'MediConnect General Hospital', area: 'Dhanmondi', distanceKm: 0, services: ['Cardiology', 'Mental Health', 'Orthopedics', 'Pediatrics', 'ICU'], capacity: 'AVAILABLE', acceptsReferrals: true },
    { id: 'h2', name: 'Northside Medical Center', area: 'Uttara', distanceKm: 14.2, services: ['Cardiology', 'Cardiac Surgery', 'ICU'], capacity: 'LIMITED', acceptsReferrals: true },
    { id: 'h3', name: 'Lakeview Hospital', area: 'Gulshan', distanceKm: 6.8, services: ['Cardiac Surgery', 'Neurology', 'ICU', 'Oncology'], capacity: 'AVAILABLE', acceptsReferrals: true },
    { id: 'h4', name: 'Riverside Clinic', area: 'Mohammadpur', distanceKm: 3.1, services: ['Pediatrics', 'Orthopedics'], capacity: 'UNCONFIRMED', acceptsReferrals: true },
    { id: 'h5', name: 'Eastgate Hospital', area: 'Rampura', distanceKm: 8.4, services: ['Oncology', 'Neurology', 'Dialysis'], capacity: 'AVAILABLE', acceptsReferrals: false },
  ]

  const referrals: Referral[] = [
    { id: 'rf1', patientId: 'p2', patientName: 'Kamal Uddin', fromDoctor: 'Dr. Tanvir Hasan', hospitalId: 'h3', hospitalName: 'Lakeview Hospital', service: 'Cardiac Surgery', reason: 'Suspected valve disease, needs surgical opinion', status: 'PENDING', createdAt: day(-1) },
    { id: 'rf2', patientId: 'p3', patientName: 'Sadia Akter', fromDoctor: 'Dr. Lina Ahmed', hospitalId: 'h1', hospitalName: 'MediConnect General Hospital', service: 'Cardiology', reason: 'Recurrent arrhythmia, needs specialist follow-up', status: 'PENDING', createdAt: day(-1) },
    { id: 'rf3', patientId: 'p1', patientName: 'Ayesha Rahman', fromDoctor: 'Dr. Tanvir Hasan', hospitalId: 'h2', hospitalName: 'Northside Medical Center', service: 'ICU', reason: 'Post-operative monitoring', status: 'DECLINED', responseNote: 'No ICU beds this week', createdAt: day(-5) },
  ]

  const bloodRequests: BloodRequest[] = [
    { id: 'br1', requesterName: 'Ayesha Rahman', bloodGroup: 'O+', units: 2, hospital: 'MediConnect General Hospital', area: 'Dhanmondi', urgent: true, status: 'OPEN', notifiedDonors: 6, acceptedDonors: 1, remindersSent: 2, createdAt: hoursAgo(3) },
    { id: 'br2', requesterName: 'Nusrat Jahan (admin)', bloodGroup: 'B-', units: 1, hospital: 'MediConnect General Hospital', area: 'Dhanmondi', urgent: false, status: 'OPEN', notifiedDonors: 3, acceptedDonors: 0, remindersSent: 1, createdAt: day(-1) },
  ]

  const donorProfile: DonorProfile = { bloodGroup: 'O+', active: true, lastDonation: day(-150), eligibleFrom: null }
  const donorAlerts: DonorAlert[] = [
    { id: 'da1', requestId: 'br1', bloodGroup: 'O+', units: 2, hospital: 'MediConnect General Hospital', area: 'Dhanmondi', urgent: true, response: 'PENDING', createdAt: hoursAgo(3) },
    { id: 'da0', requestId: 'brx', bloodGroup: 'O+', units: 1, hospital: 'Riverside Clinic', area: 'Mohammadpur', urgent: false, response: 'DECLINED', createdAt: day(-40) },
  ]

  const journal: JournalEntry[] = [
    { id: 'j1', patientId: 'p1', date: day(-6), mood: 2, text: 'Could not sleep well. Work deadlines are piling up.', sharedWith: ['d2'] },
    { id: 'j2', patientId: 'p1', date: day(-4), mood: 3, text: 'A bit better today. Went for a walk in the evening.', sharedWith: ['d2'] },
    { id: 'j3', patientId: 'p1', date: day(-2), mood: 4, text: 'Talked with my sister for an hour. Felt lighter.', sharedWith: ['d2'] },
    { id: 'j4', patientId: 'p1', date: day(-1), mood: 3, text: 'Private note: nervous about the cardiology appointment.', sharedWith: [] },
  ]

  const notifications: Record<string, AppNotification[]> = {
    p1: [
      { id: 'nt1', text: 'A donor accepted your O+ blood request.', createdAt: hoursAgo(2), read: false },
      { id: 'nt2', text: 'New bill: ECG test (৳600).', createdAt: day(-19), read: true },
    ],
    d1: [{ id: 'nt3', text: 'Northside Medical Center declined referral for Ayesha Rahman.', createdAt: day(-4), read: false }],
    n1: [{ id: 'nt4', text: 'Urgent: O+ blood needed at MediConnect General Hospital.', createdAt: hoursAgo(3), read: false }],
    a1: [{ id: 'nt5', text: 'Dr. Imran Hossain registered and is waiting for approval.', createdAt: day(-1), read: false }],
  }

  const audit: AuditEntry[] = [
    { id: 'au1', actor: 'Nusrat Jahan', action: 'Created bill', target: 'Bill b3 (Kamal Uddin)', at: day(-2) },
    { id: 'au2', actor: 'Dr. Tanvir Hasan', action: 'Recorded diagnosis', target: 'Record r1 (Ayesha Rahman)', at: day(-20) },
    { id: 'au3', actor: 'Ayesha Rahman', action: 'Paid bill', target: 'Bill b1', at: day(-20) },
  ]

  return { users, doctors, departments, appointments, records, bills, reports, hospitals, referrals, bloodRequests, donorProfile, donorAlerts, journal, notifications, audit }
}

export type MockDb = ReturnType<typeof seed>
