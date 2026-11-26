import { useQuery } from '@tanstack/react-query'
import { Activity, CalendarDays, Send, Video } from 'lucide-react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { Appointment, Referral } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { EmptyState, PageHeader, StatCard, StatusBadge } from '../../components/common'
import { Card, CardHeader } from '../../components/ui/card'
import { formatTime, isToday } from '../../lib/format'

export function DoctorDashboardPage() {
  const { user } = useAuth()
  const appts = useQuery({ queryKey: ['appointments'], queryFn: () => api.get<Appointment[]>('/appointments') })
  const refs = useQuery({ queryKey: ['referrals'], queryFn: () => api.get<Referral[]>('/referrals') })
  const today = appts.data?.filter((a) => a.status === 'BOOKED' && isToday(a.dateTime)) ?? []
  const upcoming = appts.data?.filter((a) => a.status === 'BOOKED').length ?? 0
  const needsAction = refs.data?.filter((r) => r.status === 'DECLINED' || r.status === 'MORE_INFO_NEEDED') ?? []

  return (
    <>
      <PageHeader title={`Good day, ${user?.name}`} />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Today’s appointments" value={today.length} icon={CalendarDays} />
          <StatCard label="All upcoming" value={upcoming} icon={Activity} tone="accent" />
          <StatCard label="Referrals needing action" value={needsAction.length} icon={Send} tone={needsAction.length ? 'amber' : 'brand'} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Today" action={<Link to="/doctor/appointments" className="text-sm font-medium text-brand-700 hover:underline">Open schedule</Link>} />
            {today.length ? (
              <ul className="divide-y divide-slate-100">
                {today.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-16 text-sm font-semibold text-brand-800">{formatTime(a.dateTime)}</span>
                    <span className="flex-1"><span className="block text-sm font-medium">{a.patientName}</span><span className="block truncate text-xs text-slate-500">{a.reason}</span></span>
                    {a.type === 'ONLINE' && <Video className="size-4 text-accent-600" aria-label="Online" />}
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon={CalendarDays} title="No appointments today" />}
          </Card>
          <Card>
            <CardHeader title="Referral updates" action={<Link to="/doctor/referrals" className="text-sm font-medium text-brand-700 hover:underline">All referrals</Link>} />
            {needsAction.length ? (
              <ul className="divide-y divide-slate-100">
                {needsAction.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex-1"><span className="block text-sm font-medium">{r.patientName}</span><span className="block text-xs text-slate-500">{r.hospitalName}{r.responseNote && `: “${r.responseNote}”`}</span></span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon={Send} title="Nothing needs your attention" />}
          </Card>
        </div>
      </div>
    </>
  )
}
