import {
  Activity, BookHeart, Building2, CalendarDays, ClipboardList, Droplet, FileText, HeartPulse, History,
  LayoutDashboard, LogOut, Menu, MessageCircleHeart, Receipt, Search, Send, ShieldCheck, Stethoscope, Users, X,
  type LucideIcon,
} from 'lucide-react'
import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import { API_MODE } from '../api/client'
import type { Role } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/common'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { cn } from '../lib/format'

type NavItem = { to: string; key: string; icon: LucideIcon }

const NAV: Record<Role, NavItem[]> = {
  PATIENT: [
    { to: '/patient', key: 'dashboard', icon: LayoutDashboard },
    { to: '/patient/doctors', key: 'findDoctors', icon: Search },
    { to: '/patient/appointments', key: 'appointments', icon: CalendarDays },
    { to: '/patient/history', key: 'history', icon: History },
    { to: '/patient/bills', key: 'bills', icon: Receipt },
    { to: '/patient/reports', key: 'reports', icon: FileText },
    { to: '/patient/blood', key: 'blood', icon: Droplet },
    { to: '/patient/journal', key: 'journal', icon: BookHeart },
    { to: '/patient/chat', key: 'chat', icon: MessageCircleHeart },
  ],
  DOCTOR: [
    { to: '/doctor', key: 'dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', key: 'appointments', icon: CalendarDays },
    { to: '/doctor/referrals', key: 'referrals', icon: Send },
    { to: '/doctor/journals', key: 'sharedJournals', icon: Activity },
  ],
  DONOR: [
    { to: '/donor', key: 'donorRequests', icon: Droplet },
  ],
  HOSPITAL_ADMIN: [
    { to: '/admin', key: 'dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', key: 'doctors', icon: Stethoscope },
    { to: '/admin/departments', key: 'departments', icon: Users },
    { to: '/admin/billing', key: 'billing', icon: Receipt },
    { to: '/admin/referrals', key: 'referrals', icon: ClipboardList },
    { to: '/admin/hospital', key: 'hospital', icon: Building2 },
    { to: '/admin/blood', key: 'blood', icon: Droplet },
    { to: '/admin/audit', key: 'audit', icon: ShieldCheck },
  ],
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('grid size-8 place-items-center rounded-lg', light ? 'bg-white text-brand-700' : 'bg-brand-700 text-white')}>
        <HeartPulse className="size-5" aria-hidden />
      </span>
      <span className={cn('text-lg font-bold tracking-tight', light ? 'text-white' : 'text-slate-900')}>
        MediConnect
      </span>
    </span>
  )
}

export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  return (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === 'bn' ? 'en' : 'bn')}
      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
    >
      {t('common.language')}
    </button>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  if (!user) return null
  const items = NAV[user.role]

  const nav = (
    <nav aria-label="Main" className="space-y-1 p-3">
      {items.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to.split('/').length === 2}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
          {t(`nav.${key}`)}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        {t('common.skip')}
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-100 px-5"><Logo /></div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <Logo />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-md p-1.5 hover:bg-slate-100"><X className="size-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded-md p-2 hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
          <div className="lg:hidden"><Logo /></div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <NotificationBell />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500">{t(`roles.${user.role}`)}</p>
            </div>
            <button onClick={() => logout()} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label={t('common.signOut')} title={t('common.signOut')}>
              <LogOut className="size-5" />
            </button>
          </div>
        </header>
        {API_MODE === 'mock' && (
          <p className="border-b border-amber-200 bg-amber-50 px-6 py-1.5 text-center text-xs text-amber-800">{t('common.demoMode')}</p>
        )}
        <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Suspense fallback={<Spinner />}><Outlet /></Suspense>
        </main>
      </div>
    </div>
  )
}
