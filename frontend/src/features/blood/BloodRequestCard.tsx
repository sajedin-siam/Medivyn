import { BellRing, Users, UserCheck, Siren } from 'lucide-react'
import type { ReactNode } from 'react'
import type { BloodRequest } from '../../api/types'
import { StatusBadge } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Card } from '../../components/ui/card'
import { formatDateTime } from '../../lib/format'

export function BloodRequestCard({ r, actions, showRequester }: { r: BloodRequest; actions?: ReactNode; showRequester?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-red-50 text-lg font-bold text-red-700" aria-label={`Blood group ${r.bloodGroup}`}>{r.bloodGroup}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{r.units} unit{r.units > 1 ? 's' : ''} · {r.hospital}</p>
            {r.urgent && <Badge tone="danger" icon={Siren}>Urgent</Badge>}
            <StatusBadge status={r.status} />
          </div>
          <p className="text-sm text-neutral-500">{r.area} · {formatDateTime(r.createdAt)}{showRequester && ` · by ${r.requesterName}`}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
            <div className="flex items-center gap-1.5"><Users className="size-4" aria-hidden /><dt className="sr-only">Notified</dt><dd>{r.notifiedDonors} donors notified</dd></div>
            <div className="flex items-center gap-1.5"><UserCheck className="size-4 text-brand-600" aria-hidden /><dt className="sr-only">Accepted</dt><dd>{r.acceptedDonors} accepted</dd></div>
            <div className="flex items-center gap-1.5"><BellRing className="size-4" aria-hidden /><dt className="sr-only">Reminders</dt><dd>{r.remindersSent} reminders sent</dd></div>
          </dl>
        </div>
        {actions && <div className="flex flex-col gap-2">{actions}</div>}
      </div>
    </Card>
  )
}
