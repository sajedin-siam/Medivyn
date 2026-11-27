import type { UseQueryResult } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, ChevronRight, CircleDot, Clock, HelpCircle, Inbox, MinusCircle, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Badge, type Tone } from '../ui/badge'
import { Card } from '../ui/card'
import { humanize } from '../../lib/format'
import { MOOD_ICONS } from '../../lib/mood'

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-medium text-neutral-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-base text-neutral-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: { title: string; description?: string; action?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-brand-50 p-3 text-brand-700"><Icon className="size-6" aria-hidden /></div>
      <p className="font-medium text-neutral-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** A key figure. With `to` the whole card links to the page where the user acts on it. */
export function StatCard({ label, value, icon: Icon, tone = 'brand', to }: { label: string; value: ReactNode; icon: LucideIcon; tone?: 'brand' | 'accent' | 'red' | 'amber'; to?: string }) {
  const bg = { brand: 'bg-brand-50 text-brand-700', accent: 'bg-accent-50 text-accent-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-700' }[tone]
  const body = (
    <>
      <div className={`rounded-xl p-3 ${bg}`}><Icon className="size-5" aria-hidden /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-600">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-neutral-900">{value}</p>
      </div>
      {to && <ChevronRight className="size-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </>
  )
  return to
    ? <Link to={to} className="group flex items-center gap-4 rounded-xl border border-neutral-900/10 bg-white p-6 transition-[border-color,box-shadow] hover:border-brand-600/40 hover:shadow-sm">{body}</Link>
    : <Card className="flex items-center gap-4 p-6">{body}</Card>
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
      <span className="size-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-hidden />
      {label}…
    </div>
  )
}

/** Grey placeholder lines in the shape of the content that is loading, so the page doesn't jump when it arrives. */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" className="space-y-3 p-5">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} aria-hidden className="h-4 animate-pulse rounded bg-neutral-200/80" style={{ width: `${[92, 76, 84, 64][i % 4]}%` }} />
      ))}
    </div>
  )
}

/** Renders loading and error states so pages only handle the data. */
export function QueryState<T>({ query, children }: { query: UseQueryResult<T>; children: (data: T) => ReactNode }) {
  if (query.isPending) return <Skeleton />
  if (query.isError)
    return (
      <div role="alert" className="flex flex-wrap items-center gap-2 p-5 text-sm text-red-700">
        <AlertTriangle className="size-4 shrink-0" aria-hidden /> This could not be loaded ({query.error.message}).
        <button className="font-medium underline underline-offset-2" onClick={() => query.refetch()}>Try again</button>
      </div>
    )
  return <>{children(query.data)}</>
}

const STATUS_TONES: Record<string, Tone> = {
  BOOKED: 'info', COMPLETED: 'success', CANCELLED: 'neutral',
  PAID: 'success', UNPAID: 'warning',
  PENDING: 'warning', ACCEPTED: 'success', DECLINED: 'danger', MORE_INFO_NEEDED: 'accent', APPROVED: 'success',
  OPEN: 'info', FULFILLED: 'success',
  AVAILABLE: 'success', LIMITED: 'warning', UNCONFIRMED: 'neutral',
}
// an icon per tone, so a status never relies on colour alone
const TONE_ICONS: Record<Tone, LucideIcon> = {
  success: CheckCircle2, warning: Clock, danger: XCircle, info: CircleDot, accent: HelpCircle, neutral: MinusCircle,
}
export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? 'neutral'
  return <Badge tone={tone} icon={TONE_ICONS[tone]}>{humanize(status)}</Badge>
}

export function MoodIcon({ mood, className }: { mood: number; className?: string }) {
  const Icon = MOOD_ICONS[mood]
  return <Icon className={className} strokeWidth={1.75} aria-hidden />
}
