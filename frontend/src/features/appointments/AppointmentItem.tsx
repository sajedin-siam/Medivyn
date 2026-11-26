import { CalendarDays, Video } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Appointment } from '../../api/types'
import { StatusBadge } from '../../components/common'
import { formatDateTime } from '../../lib/format'

export function AppointmentItem({ a, who, actions }: { a: Appointment; who: string; actions?: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-4">
      <div className="rounded-lg bg-brand-50 p-2.5 text-brand-700">
        {a.type === 'ONLINE' ? <Video className="size-5" aria-label="Online session" /> : <CalendarDays className="size-5" aria-label="In person" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{who}</p>
        <p className="text-sm text-slate-500">{formatDateTime(a.dateTime)} · {a.type === 'ONLINE' ? 'Online session' : 'In person'}</p>
        <p className="mt-0.5 truncate text-sm text-slate-600">{a.reason}</p>
      </div>
      <StatusBadge status={a.status} />
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </li>
  )
}
