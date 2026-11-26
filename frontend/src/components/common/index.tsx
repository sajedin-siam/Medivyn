import type { UseQueryResult } from '@tanstack/react-query'
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, type Tone } from '../ui/badge'
import { Card } from '../ui/card'
import { humanize } from '../../lib/format'

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

export function StatCard({ label, value, icon: Icon, tone = 'brand' }: { label: string; value: ReactNode; icon: LucideIcon; tone?: 'brand' | 'accent' | 'red' | 'amber' }) {
  const bg = { brand: 'bg-brand-50 text-brand-700', accent: 'bg-accent-50 text-accent-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-700' }[tone]
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className={`rounded-xl p-3 ${bg}`}><Icon className="size-5" aria-hidden /></div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-3xl font-medium tracking-tight text-neutral-900">{value}</p>
      </div>
    </Card>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
      <span className="size-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-hidden />
      {label}…
    </div>
  )
}

/** Renders loading and error states so pages only handle the data. */
export function QueryState<T>({ query, children }: { query: UseQueryResult<T>; children: (data: T) => ReactNode }) {
  if (query.isPending) return <Spinner />
  if (query.isError)
    return (
      <div role="alert" className="flex items-center gap-2 p-5 text-sm text-red-700">
        <AlertTriangle className="size-4" /> Could not load data: {query.error.message}
        <button className="ml-2 underline" onClick={() => query.refetch()}>Try again</button>
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
export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? 'neutral'}>{humanize(status)}</Badge>
}
