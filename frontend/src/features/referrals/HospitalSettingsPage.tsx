import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api/client'
import type { Capacity, Hospital } from '../../api/types'
import { PageHeader, QueryState } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card, CardBody, CardHeader } from '../../components/ui/card'
import { useAction } from '../../hooks/useAction'
import { cn, humanize } from '../../lib/format'
import { SERVICES } from './services'

function Editor({ hospital }: { hospital: Hospital }) {
  const [services, setServices] = useState(hospital.services)
  const [capacity, setCapacity] = useState<Capacity>(hospital.capacity)
  const [accepts, setAccepts] = useState(hospital.acceptsReferrals)
  const save = useAction(() => api.put('/admin/hospital', { services, capacity, acceptsReferrals: accepts }), { success: 'Hospital settings saved', invalidate: [['hospital']] })
  const toggle = (s: string) => setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Current capacity" description="Shown to doctors when they choose where to refer a patient." />
        <CardBody className="grid gap-2 sm:grid-cols-3">
          {(['AVAILABLE', 'LIMITED', 'UNCONFIRMED'] as const).map((c) => (
            <label key={c} className={cn('cursor-pointer rounded-lg border p-3 text-sm font-medium', capacity === c ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-neutral-200')}>
              <input type="radio" name="capacity" className="mr-2 accent-brand-700" checked={capacity === c} onChange={() => setCapacity(c)} />
              {humanize(c)}
            </label>
          ))}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Services offered" />
        <CardBody className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)} aria-pressed={services.includes(s)}
              className={cn('rounded-full border px-3 py-1.5 text-sm', services.includes(s) ? 'border-brand-600 bg-brand-700 text-white' : 'border-neutral-300 text-neutral-700 hover:border-brand-600')}>
              {s}
            </button>
          ))}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="size-5 accent-brand-700" checked={accepts} onChange={(e) => setAccepts(e.target.checked)} />
            <span><span className="block font-medium">Accept referrals</span><span className="block text-sm text-neutral-500">Turn off to stop receiving new referral requests.</span></span>
          </label>
        </CardBody>
      </Card>
      <div className="flex justify-end"><Button loading={save.isPending} onClick={() => save.mutate(undefined)}>Save changes</Button></div>
    </div>
  )
}

export function HospitalSettingsPage() {
  const q = useQuery({ queryKey: ['hospital'], queryFn: () => api.get<Hospital>('/admin/hospital') })
  return (
    <>
      <PageHeader title="Services and capacity" description={q.data?.name} />
      <QueryState query={q}>{(h) => <Editor hospital={h} />}</QueryState>
    </>
  )
}
