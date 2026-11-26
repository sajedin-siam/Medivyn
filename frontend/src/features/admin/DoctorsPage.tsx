import { useQuery } from '@tanstack/react-query'
import { Stethoscope } from 'lucide-react'
import { api } from '../../api/client'
import type { Doctor } from '../../api/types'
import { EmptyState, PageHeader, QueryState, StatusBadge } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Table, Td, Th } from '../../components/ui/table'
import { useAction } from '../../hooks/useAction'
import { formatTaka } from '../../lib/format'

export function DoctorsPage() {
  const q = useQuery({ queryKey: ['admin-doctors'], queryFn: () => api.get<Doctor[]>('/admin/doctors') })
  const approve = useAction((id: string) => api.post(`/admin/doctors/${id}/approve`), { success: 'Doctor approved and can now sign in', invalidate: [['admin-doctors'], ['admin-summary']] })
  const remove = useAction((id: string) => api.del(`/admin/doctors/${id}`), { success: 'Doctor removed', invalidate: [['admin-doctors']] })

  return (
    <>
      <PageHeader title="Doctors" description="Approve new doctor accounts and manage the hospital’s doctors." />
      <Card>
        <QueryState query={q}>
          {(list) => list.length ? (
            <Table>
              <thead><tr><Th>Name</Th><Th>Specialty</Th><Th>Fee</Th><Th>Status</Th><Th><span className="sr-only">Actions</span></Th></tr></thead>
              <tbody>
                {[...list].sort((a, b) => a.status.localeCompare(b.status) * -1).map((d) => (
                  <tr key={d.id}>
                    <Td className="font-medium">{d.name}</Td>
                    <Td>{d.specialty}</Td>
                    <Td>{formatTaka(d.fee)}</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        {d.status === 'PENDING' && <Button size="sm" loading={approve.isPending && approve.variables === d.id} onClick={() => approve.mutate(d.id)}>Approve</Button>}
                        <Button size="sm" variant="ghost" onClick={() => confirm(`Remove ${d.name}?`) && remove.mutate(d.id)}>Remove</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <EmptyState icon={Stethoscope} title="No doctors yet" />}
        </QueryState>
      </Card>
    </>
  )
}
