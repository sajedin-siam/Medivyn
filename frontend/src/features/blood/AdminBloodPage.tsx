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

export function AdminBloodPage() {
  const [open, setOpen] = useState(false)
  const reqs = useQuery({ queryKey: ['blood-requests'], queryFn: () => api.get<BloodRequest[]>('/blood-requests'), refetchInterval: 20_000 })
  const confirmDonation = useAction((id: string) => api.post(`/admin/blood-requests/${id}/confirm-donation`), {
    success: 'Donation confirmed. The donor is now in their recovery period.',
    invalidate: [['blood-requests']],
  })

  return (
    <>
      <PageHeader title="Blood requests" description="Post requests for the hospital and confirm completed donations."
        action={<Button variant="danger" onClick={() => setOpen(true)}><Droplet className="size-4" /> Request blood</Button>} />
      <QueryState query={reqs}>
        {(list) => list.length ? (
          <div className="space-y-4">
            {list.map((r) => (
              <BloodRequestCard key={r.id} r={r} showRequester actions={r.status === 'OPEN' && (
                <Button size="sm" disabled={r.acceptedDonors === 0} title={r.acceptedDonors === 0 ? 'No donor has accepted yet' : undefined}
                  loading={confirmDonation.isPending && confirmDonation.variables === r.id} onClick={() => confirmDonation.mutate(r.id)}>
                  Confirm donation
                </Button>
              )} />
            ))}
          </div>
        ) : <Card><EmptyState icon={Droplet} title="No blood requests" /></Card>}
      </QueryState>
      <BloodRequestDialog open={open} onClose={() => setOpen(false)} defaultHospital="MediConnect General Hospital" />
    </>
  )
}
