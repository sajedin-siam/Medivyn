import { CalendarDays, Droplet, HeartHandshake, Hospital, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { HOME_BY_ROLE, useAuth } from '../../auth/useAuth'
import { LanguageToggle, Logo } from '../../layouts/AppLayout'

export function LandingPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />

  const features: [LucideIcon, string, string][] = [
    [CalendarDays, t('landing.f1'), t('landing.f1d')],
    [Hospital, t('landing.f2'), t('landing.f2d')],
    [Droplet, t('landing.f3'), t('landing.f3d')],
    [HeartHandshake, t('landing.f4'), t('landing.f4d')],
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">{t('landing.signIn')}</Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-[#11706f] to-accent-600 text-white">
        <svg className="absolute inset-x-0 bottom-6 w-full opacity-20" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden>
          <path d="M0 50 H380 l12 -10 l10 10 H460 l8 12 l14 -55 l14 75 l10 -32 H600 l14 -10 l12 10 H1200" fill="none" stroke="white" strokeWidth="2.5" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">{t('landing.tagline')}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{t('landing.title')}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">{t('landing.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-800 shadow hover:bg-brand-50">{t('landing.register')}</Link>
            <Link to="/login" className="rounded-lg px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/60 hover:bg-white/10">{t('landing.signIn')}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([Icon, title, desc]) => (
          <div key={title}>
            <div className="mb-3 inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-700"><Icon className="size-5" aria-hidden /></div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-500">
        Academic project. Not a certified medical system. AI features are assistive only.
      </footer>
    </div>
  )
}
