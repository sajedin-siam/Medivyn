import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { Referral, ReferralStatus } from '../../api/types'
import { EmptyState, PageHeader, QueryState, StatusBadge } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Field, Textarea } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { formatDate, humanize } from '../../lib/format'

function RespondDialog({ target, onClose }: { target: { r: Referral; status: ReferralStatus } | null; onClose: () => void }) {
  const [note, setNote] = useState('')
  const respond = useAction(
    () => api.post(`/referrals/${target!.r.id}/respond`, { status: target!.status, note: note.trim() || undefined }),
    { success: 'Response sent to the referring doctor', invalidate: [['referrals']], onSuccess: () => { setNote(''); onClose() } },
  )
  const needsNote = target?.status !== 'ACCEPTED'
  return (
    <Dialog open={!!target} onClose={onClose} title={target ? `${humanize(target.status)}: ${target.r.patientName}` : ''}>
      {target && (
        <div className="space-y-4">
          {target.status === 'ACCEPTED' && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800">The patient’s medical reports will be transferred to your hospital automatically.</p>}
          <Field label={needsNote ? 'Note to the doctor (required)' : 'Note to the doctor (optional)'}>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={target.status === 'MORE_INFO_NEEDED' ? 'What information do you need?' : ''} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant={target.status === 'DECLINED' ? 'danger' : 'primary'} disabled={needsNote && !note.trim()} loading={respond.isPending} onClick={() => respond.mutate(undefined)}>
              {humanize(target.status)}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}

export function AdminReferralsPage() {
  const refs = useQuery({ queryKey: ['referrals'], queryFn: () => api.get<Referral[]>('/referrals') })
  const [target, setTarget] = useState<{ r: Referral; status: ReferralStatus } | null>(null)
  return (
    <>
      <PageHeader title="Incoming referrals" description="Referral requests sent to your hospital." />
      <Card>
        <QueryState query={refs}>
          {(list) => list.length ? (
            <ul className="divide-y divide-slate-100">
              {list.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{r.patientName} <span className="font-normal text-slate-500">from {r.fromDoctor}</span></p>
                    <p className="text-sm text-slate-500"><Badge tone="accent">{r.service}</Badge> <span className="ml-1">{formatDate(r.createdAt)}</span></p>
                    <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
                  </div>
                  {r.status === 'PENDING' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => setTarget({ r, status: 'ACCEPTED' })}>Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => setTarget({ r, status: 'MORE_INFO_NEEDED' })}>Need info</Button>
                      <Button size="sm" variant="secondary" onClick={() => setTarget({ r, status: 'DECLINED' })}>Decline</Button>
                    </div>
                  ) : <StatusBadge status={r.status} />}
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={ClipboardList} title="No referrals" />}
        </QueryState>
      </Card>
      <RespondDialog target={target} onClose={() => setTarget(null)} />
    </>
  )
}
