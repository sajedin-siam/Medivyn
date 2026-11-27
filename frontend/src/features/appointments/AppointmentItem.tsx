import { CalendarDays, Video } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Appointment } from '../../api/types'
import { StatusBadge } from '../../components/common'
import { formatDateTime } from '../../lib/format'

export function AppointmentItem({ a, who, actions }: { a: Appointment; who: string; actions?: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
      <div className="hidden rounded-lg bg-brand-50 p-2.5 text-brand-700 sm:block">
        {a.type === 'ONLINE' ? <Video className="size-5" aria-hidden /> : <CalendarDays className="size-5" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-medium">{who}</p>
          <StatusBadge status={a.status} />
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-600">
          {a.type === 'ONLINE' ? <Video className="size-4 shrink-0 sm:hidden" aria-hidden /> : <CalendarDays className="size-4 shrink-0 sm:hidden" aria-hidden />}
          {formatDateTime(a.dateTime)} · {a.type === 'ONLINE' ? 'Online session' : 'In person'}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">{a.reason}</p>
      </div>
      {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>}
    </li>
  )
}
