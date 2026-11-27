import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router'
import { API_MODE } from '../../api/client'
import { HOME_BY_ROLE, useAuth, type LoginInput } from '../../auth/useAuth'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input } from '../../components/ui/form'
import { Logo } from '../../layouts/AppLayout'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  )
}

export function LoginPage() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const location = useLocation()
  const [busy, setBusy] = useState<'password' | 'google' | null>(null)
  const [error, setError] = useState('')

  async function run(kind: 'password' | 'google', input: LoginInput) {
    setBusy(kind)
    setError('')
    try {
      await login(input)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from?.startsWith(HOME_BY_ROLE[user.role]) ? from : HOME_BY_ROLE[user.role]} replace />
  }

  return (
    // reduced-motion users get the poster as a still background instead of the video
    <div className="relative grid min-h-screen place-items-center bg-neutral-900 bg-[url(/assets/video/login-bg.jpg)] bg-cover bg-center px-4 py-10">
      <video
        className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        src="/assets/video/login-bg.mp4" poster="/assets/video/login-bg.jpg"
        autoPlay muted loop playsInline aria-hidden
      />
      <div className="absolute inset-0 bg-neutral-950/55" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/" className="rounded-full bg-white px-4 py-2 shadow-sm"><Logo /></Link></div>
        <Card className="p-8">
          <h1 className="text-3xl font-medium">{t('login.title')}</h1>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              run('password', { username: String(f.get('username')), password: String(f.get('password')) })
            }}
          >
            <Field label={t('login.username')} required><Input name="username" type="email" autoComplete="username" required /></Field>
            <Field label={t('login.password')} required><Input name="password" type="password" autoComplete="current-password" required /></Field>
            {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
            <Button type="submit" className="w-full" loading={busy === 'password'} disabled={!!busy}>{t('login.submit')}</Button>
          </form>
          <div className="my-5 flex items-center gap-3 text-sm text-neutral-500">
            <span className="h-px flex-1 bg-neutral-900/10" />{t('login.or')}<span className="h-px flex-1 bg-neutral-900/10" />
          </div>
          <Button variant="secondary" className="w-full" loading={busy === 'google'} disabled={!!busy} onClick={() => run('google', 'google')}>
            <GoogleIcon />{t('login.google')}
          </Button>
          {API_MODE === 'mock' && <p className="mt-4 text-center text-xs text-neutral-500">{t('login.demoHint')}</p>}
          <p className="mt-6 text-center text-sm text-neutral-600">
            {t('login.noAccount')} <Link to="/register" className="font-medium text-brand-700 hover:underline">{t('landing.register')}</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
