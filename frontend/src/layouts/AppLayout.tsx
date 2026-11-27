import {
  Activity, BookHeart, Building2, CalendarDays, ClipboardList, Droplet, FileText, History,
  LayoutDashboard, LogOut, Menu, MessageCircleHeart, PhoneCall, Receipt, Search, Send, ShieldCheck, Stethoscope, Users, X,
  type LucideIcon,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import { API_MODE } from '../api/client'
import type { Role } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/common'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { cn } from '../lib/format'

type NavItem = { to: string; key: string; icon: LucideIcon }
// groups keep long menus scannable; a group without a title sits at the top
type NavGroup = { title?: string; items: NavItem[] }

const NAV: Record<Role, NavGroup[]> = {
  PATIENT: [
    { items: [{ to: '/patient', key: 'dashboard', icon: LayoutDashboard }] },
    { title: 'care', items: [
      { to: '/patient/doctors', key: 'findDoctors', icon: Search },
      { to: '/patient/appointments', key: 'appointments', icon: CalendarDays },
      { to: '/patient/blood', key: 'blood', icon: Droplet },
    ] },
    { title: 'records', items: [
      { to: '/patient/history', key: 'history', icon: History },
      { to: '/patient/reports', key: 'reports', icon: FileText },
      { to: '/patient/bills', key: 'bills', icon: Receipt },
    ] },
    { title: 'wellbeing', items: [
      { to: '/patient/journal', key: 'journal', icon: BookHeart },
      { to: '/patient/chat', key: 'chat', icon: MessageCircleHeart },
    ] },
  ],
  DOCTOR: [
    { items: [
      { to: '/doctor', key: 'dashboard', icon: LayoutDashboard },
      { to: '/doctor/appointments', key: 'appointments', icon: CalendarDays },
      { to: '/doctor/referrals', key: 'referrals', icon: Send },
      { to: '/doctor/journals', key: 'sharedJournals', icon: Activity },
    ] },
  ],
  DONOR: [
    { items: [{ to: '/donor', key: 'donorRequests', icon: Droplet }] },
  ],
  HOSPITAL_ADMIN: [
    { items: [{ to: '/admin', key: 'dashboard', icon: LayoutDashboard }] },
    { title: 'care', items: [
      { to: '/admin/referrals', key: 'referrals', icon: ClipboardList },
      { to: '/admin/blood', key: 'blood', icon: Droplet },
    ] },
    { title: 'administration', items: [
      { to: '/admin/doctors', key: 'doctors', icon: Stethoscope },
      { to: '/admin/departments', key: 'departments', icon: Users },
      { to: '/admin/billing', key: 'billing', icon: Receipt },
      { to: '/admin/hospital', key: 'hospital', icon: Building2 },
      { to: '/admin/audit', key: 'audit', icon: ShieldCheck },
    ] },
  ],
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={cn('grid size-7 place-items-center rounded-md text-sm font-semibold', light ? 'bg-white text-brand-600' : 'bg-brand-600 text-white')}>
        M
      </span>
      <span className={cn('text-xl font-medium tracking-[-0.02em]', light ? 'text-white' : 'text-neutral-900')}>
        MediConnect
      </span>
    </span>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])
  if (!user) return null

  const sidebar = (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto p-3">
        {NAV[user.role].map((group, gi) => (
          <div key={gi}>
            {group.title && <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{t(`nav.group.${group.title}`)}</p>}
            <ul className="space-y-0.5">
              {group.items.map(({ to, key, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to.split('/').length === 2}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => cn(
                      'relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-800 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-brand-600'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    {t(`nav.${key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {(user.role === 'PATIENT' || user.role === 'DONOR') && (
        <a href="tel:999" className="m-3 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 transition-colors hover:bg-red-100">
          <PhoneCall className="size-5 shrink-0" aria-hidden />
          <span className="text-sm leading-snug"><span className="block font-semibold">{t('common.emergencyTitle')}</span>{t('common.emergencyText')}</span>
        </a>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        {t('common.skip')}
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-neutral-900/10 bg-white lg:flex">
        <div className="flex h-[72px] shrink-0 items-center px-6"><Logo /></div>
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-[72px] shrink-0 items-center justify-between px-4 pl-6">
              <Logo />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-lg hover:bg-neutral-100"><X className="size-5" /></button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-neutral-900/10 bg-white px-4 sm:px-8">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} className="grid size-11 place-items-center rounded-lg hover:bg-neutral-100 lg:hidden"><Menu className="size-5" /></button>
          <div className="lg:hidden"><Logo /></div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NotificationBell />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-sm text-neutral-500">{t(`roles.${user.role}`)}</p>
            </div>
            <button onClick={() => logout()} className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900" aria-label={t('common.signOut')}>
              <LogOut className="size-5" aria-hidden />
              <span className="hidden sm:inline">{t('common.signOut')}</span>
            </button>
          </div>
        </header>
        {API_MODE === 'mock' && (
          <p className="border-b border-amber-200 bg-amber-50 px-6 py-1.5 text-center text-xs text-amber-800">{t('common.demoMode')}</p>
        )}
        <main id="main" className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
          <Suspense fallback={<Spinner />}><Outlet /></Suspense>
        </main>
      </div>
    </div>
  )
}
