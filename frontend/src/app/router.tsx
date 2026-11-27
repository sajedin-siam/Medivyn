import { lazy, type ComponentType, type ReactNode } from 'react'
import { createBrowserRouter, Link } from 'react-router'
import { RequireRole } from '../auth/RequireRole'
const AdminDashboardPage = page(() => import('../features/admin/AdminDashboardPage'), 'AdminDashboardPage')
const AuditPage = page(() => import('../features/admin/AuditPage'), 'AuditPage')
const DepartmentsPage = page(() => import('../features/admin/DepartmentsPage'), 'DepartmentsPage')
const DoctorsPage = page(() => import('../features/admin/DoctorsPage'), 'DoctorsPage')
import { LandingPage } from '../features/account/LandingPage'
import { LoginPage } from '../features/account/LoginPage'
import { RegisterPage } from '../features/account/RegisterPage'
import { AppLayout } from '../layouts/AppLayout'

const DoctorAppointmentsPage = page(() => import('../features/appointments/DoctorAppointmentsPage'), 'DoctorAppointmentsPage')
const DoctorDashboardPage = page(() => import('../features/appointments/DoctorDashboardPage'), 'DoctorDashboardPage')
const FindDoctorsPage = page(() => import('../features/appointments/FindDoctorsPage'), 'FindDoctorsPage')
const PatientAppointmentsPage = page(() => import('../features/appointments/PatientAppointmentsPage'), 'PatientAppointmentsPage')
const PatientDashboardPage = page(() => import('../features/appointments/PatientDashboardPage'), 'PatientDashboardPage')
const AdminBillingPage = page(() => import('../features/billing/AdminBillingPage'), 'AdminBillingPage')
const PatientBillsPage = page(() => import('../features/billing/PatientBillsPage'), 'PatientBillsPage')
const AdminBloodPage = page(() => import('../features/blood/AdminBloodPage'), 'AdminBloodPage')
const DonorPage = page(() => import('../features/blood/DonorPage'), 'DonorPage')
const PatientBloodPage = page(() => import('../features/blood/PatientBloodPage'), 'PatientBloodPage')
const HistoryPage = page(() => import('../features/clinical/HistoryPage'), 'HistoryPage')
const AdminReferralsPage = page(() => import('../features/referrals/AdminReferralsPage'), 'AdminReferralsPage')
const DoctorReferralsPage = page(() => import('../features/referrals/DoctorReferralsPage'), 'DoctorReferralsPage')
const HospitalSettingsPage = page(() => import('../features/referrals/HospitalSettingsPage'), 'HospitalSettingsPage')
const ReportsPage = page(() => import('../features/reports/ReportsPage'), 'ReportsPage')
const ChatPage = page(() => import('../features/wellbeing/ChatPage'), 'ChatPage')
const DoctorJournalsPage = page(() => import('../features/wellbeing/DoctorJournalsPage'), 'DoctorJournalsPage')
const JournalPage = page(() => import('../features/wellbeing/JournalPage'), 'JournalPage')

// Each screen is its own chunk, so a patient never downloads the admin charts.
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => load().then((m) => ({ default: m[name] })))
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-5xl font-bold text-brand-700">404</p>
        <p className="mt-2 text-neutral-600">This page does not exist.</p>
        <Link to="/" className="mt-4 inline-block font-medium text-brand-700 hover:underline">Go home</Link>
      </div>
    </div>
  )
}

const section = (role: Parameters<typeof RequireRole>[0]['role'], path: string, children: { path?: string; element: ReactNode }[]) => ({
  path,
  element: <RequireRole role={role} />,
  children: [{ element: <AppLayout />, children: children.map((c) => (c.path ? c : { index: true, element: c.element })) }],
})

export const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/callback', element: <LoginPage /> },
  section('PATIENT', '/patient', [
    { element: <PatientDashboardPage /> },
    { path: 'doctors', element: <FindDoctorsPage /> },
    { path: 'appointments', element: <PatientAppointmentsPage /> },
    { path: 'history', element: <HistoryPage /> },
    { path: 'bills', element: <PatientBillsPage /> },
    { path: 'reports', element: <ReportsPage /> },
    { path: 'blood', element: <PatientBloodPage /> },
    { path: 'journal', element: <JournalPage /> },
    { path: 'chat', element: <ChatPage /> },
  ]),
  section('DOCTOR', '/doctor', [
    { element: <DoctorDashboardPage /> },
    { path: 'appointments', element: <DoctorAppointmentsPage /> },
    { path: 'referrals', element: <DoctorReferralsPage /> },
    { path: 'journals', element: <DoctorJournalsPage /> },
  ]),
  section('DONOR', '/donor', [{ element: <DonorPage /> }]),
  section('HOSPITAL_ADMIN', '/admin', [
    { element: <AdminDashboardPage /> },
    { path: 'doctors', element: <DoctorsPage /> },
    { path: 'departments', element: <DepartmentsPage /> },
    { path: 'billing', element: <AdminBillingPage /> },
    { path: 'referrals', element: <AdminReferralsPage /> },
    { path: 'hospital', element: <HospitalSettingsPage /> },
    { path: 'blood', element: <AdminBloodPage /> },
    { path: 'audit', element: <AuditPage /> },
  ]),
  { path: '*', element: <NotFound /> },
]

export const router = createBrowserRouter(routes)
