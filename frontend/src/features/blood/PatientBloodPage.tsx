import { useQuery } from '@tanstack/react-query'
import { Droplet } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { BloodRequest } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { useAction } from '../../hooks/useAction'
import { BloodRequestCard } from './BloodRequestCard'
import { BloodRequestDialog } from './BloodRequestDialog'

export function PatientBloodPage() {
  const [open, setOpen] = useState(false)
  // refreshes while open requests are waiting for donors
  const reqs = useQuery({ queryKey: ['blood-requests'], queryFn: () => api.get<BloodRequest[]>('/blood-requests'), refetchInterval: 20_000 })
  const cancel = useAction((id: string) => api.post(`/blood-requests/${id}/cancel`), { success: 'Request cancelled', invalidate: [['blood-requests']] })

  return (
    <>
      <PageHeader title="Blood requests" description="Find nearby compatible donors quickly." action={<Button variant="danger" onClick={() => setOpen(true)}><Droplet className="size-4" /> Request blood</Button>} />
      <QueryState query={reqs}>
        {(list) => list.length ? (
          <div className="space-y-4">
            {list.map((r) => (
              <BloodRequestCard key={r.id} r={r} actions={r.status === 'OPEN' && (
                <Button size="sm" variant="secondary" onClick={() => confirm('Cancel this blood request?') && cancel.mutate(r.id)}>Cancel</Button>
              )} />
            ))}
          </div>
        ) : <Card><EmptyState icon={Droplet} title="No blood requests" description="Post a request and we will alert compatible donors near the hospital." /></Card>}
      </QueryState>
      <BloodRequestDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
