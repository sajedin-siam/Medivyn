import { useQuery } from '@tanstack/react-query'
import { Droplet, Lock, MapPin } from 'lucide-react'
import { api } from '../../api/client'
import type { DonorAlert, DonorProfile } from '../../api/types'
import { EmptyState, PageHeader, QueryState, StatusBadge } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardBody, CardHeader } from '../../components/ui/card'
import { useAction } from '../../hooks/useAction'
import { formatDate, formatDateTime } from '../../lib/format'

function ProfileCard({ p }: { p: DonorProfile }) {
  const toggle = useAction((active: boolean) => api.patch<DonorProfile>('/donor/profile', { active }), {
    success: (r) => (r.active ? 'You are now available to donate' : 'You will not receive requests'),
    invalidate: [['donor-profile']],
  })
  const recovering = !!p.eligibleFrom && new Date(p.eligibleFrom) > new Date()
  return (
    <Card>
      <CardBody className="flex flex-wrap items-center gap-6">
        <div className="grid size-16 place-items-center rounded-2xl bg-red-50 text-2xl font-bold text-red-700" aria-label={`Your blood group ${p.bloodGroup}`}>{p.bloodGroup}</div>
        <div className="flex-1">
          <p className="flex items-center gap-2 font-semibold">
            Status: <Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'Active' : 'Inactive'}</Badge>
          </p>
          <p className="mt-1 text-sm text-slate-500">Last donation: {p.lastDonation ? formatDate(p.lastDonation) : 'none recorded'}</p>
          {recovering && <p className="mt-1 text-sm text-amber-700">Recovery period until {formatDate(p.eligibleFrom!)}. You can set yourself active after that.</p>}
        </div>
        <label className="flex items-center gap-3">
          <span className="text-sm font-medium">Available to donate</span>
          <input type="checkbox" role="switch" className="peer sr-only" checked={p.active} disabled={toggle.isPending || (recovering && !p.active)}
            onChange={(e) => toggle.mutate(e.target.checked)} />
          <span aria-hidden className="relative h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-brand-600 peer-disabled:opacity-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </CardBody>
    </Card>
  )
}

export function DonorPage() {
  const profile = useQuery({ queryKey: ['donor-profile'], queryFn: () => api.get<DonorProfile>('/donor/profile') })
  const alerts = useQuery({ queryKey: ['donor-alerts'], queryFn: () => api.get<DonorAlert[]>('/donor/alerts'), refetchInterval: 20_000 })
  const respond = useAction(
    ({ id, response }: { id: string; response: 'ACCEPTED' | 'DECLINED' }) => api.post(`/donor/alerts/${id}/respond`, { response }),
    { success: (r) => ((r as DonorAlert).response === 'ACCEPTED' ? 'Thank you! The hospital has been told you are coming.' : 'Request declined'), invalidate: [['donor-alerts']] },
  )

  return (
    <>
      <PageHeader title="Blood donation" description="Requests from hospitals near you that match your blood group." />
      <div className="space-y-6">
        <QueryState query={profile}>{(p) => <ProfileCard p={p} />}</QueryState>
        <p className="flex items-center gap-2 text-sm text-slate-500"><Lock className="size-4" aria-hidden /> Your location is used only for matching. It is never shown to patients, hospitals or other donors.</p>
        <Card>
          <CardHeader title="Requests" />
          <QueryState query={alerts}>
            {(list) => list.length ? (
              <ul className="divide-y divide-slate-100">
                {list.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <div className="grid size-12 place-items-center rounded-xl bg-red-50 font-bold text-red-700">{a.bloodGroup}</div>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-medium">{a.units} unit{a.units > 1 ? 's' : ''} at {a.hospital} {a.urgent && <Badge tone="danger">Urgent</Badge>}</p>
                      <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="size-3.5" aria-hidden /> {a.area} · {formatDateTime(a.createdAt)}</p>
                    </div>
                    {a.response === 'PENDING' ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => respond.mutate({ id: a.id, response: 'ACCEPTED' })}>I can donate</Button>
                        <Button size="sm" variant="secondary" onClick={() => respond.mutate({ id: a.id, response: 'DECLINED' })}>Not now</Button>
                      </div>
                    ) : <StatusBadge status={a.response} />}
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon={Droplet} title="No requests right now" description="We will notify you when someone nearby needs your blood group." />}
          </QueryState>
        </Card>
      </div>
    </>
  )
}
