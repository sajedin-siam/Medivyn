import { Droplet, HeartPulse, Hospital, Stethoscope, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router'
import { API_MODE } from '../../api/client'
import type { Role } from '../../api/types'
import { HOME_BY_ROLE, useAuth } from '../../auth/useAuth'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Logo } from '../../layouts/AppLayout'

const DEMO: [Role, LucideIcon, string][] = [
  ['PATIENT', HeartPulse, 'Ayesha Rahman'],
  ['DOCTOR', Stethoscope, 'Dr. Tanvir Hasan'],
  ['DONOR', Droplet, 'Rafiq Islam'],
  ['HOSPITAL_ADMIN', Hospital, 'Nusrat Jahan'],
]

export function LoginPage() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const location = useLocation()
  const [busy, setBusy] = useState<Role | 'kc' | null>(null)

  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from?.startsWith(HOME_BY_ROLE[user.role]) ? from : HOME_BY_ROLE[user.role]} replace />
  }

  return (
    <div className="grid min-h-screen place-items-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/"><Logo /></Link></div>
        <Card className="p-8">
          <h1 className="text-3xl font-medium">{t('login.title')}</h1>
          {API_MODE === 'live' ? (
            <Button className="mt-6 w-full" loading={busy === 'kc'} onClick={() => { setBusy('kc'); login() }}>
              {t('login.keycloak')}
            </Button>
          ) : (
            <>
              <p className="mt-2 text-neutral-600">{t('login.demoTitle')}</p>
              <div className="mt-5 grid gap-2">
                {DEMO.map(([role, Icon, name]) => (
                  <button
                    key={role}
                    onClick={() => { setBusy(role); login(role) }}
                    disabled={!!busy}
                    className="flex items-center gap-3 rounded-xl border border-neutral-900/10 px-4 py-3 text-left transition-[border-color,background-color,transform,box-shadow] duration-150 enabled:hover:-translate-y-0.5 enabled:hover:border-brand-600 enabled:hover:shadow-md enabled:active:translate-y-0 disabled:opacity-60"
                  >
                    <span className="rounded-lg bg-brand-50 p-2 text-brand-700"><Icon className="size-5" aria-hidden /></span>
                    <span>
                      <span className="block text-sm font-semibold">{t(`roles.${role}`)}</span>
                      <span className="block text-[13px] text-neutral-500">{name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="mt-6 text-center text-sm text-neutral-600">
            {t('login.noAccount')} <Link to="/register" className="font-medium text-brand-700 hover:underline">{t('landing.register')}</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
