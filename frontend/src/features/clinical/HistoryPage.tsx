import { useQuery } from '@tanstack/react-query'
import { History, Lock } from 'lucide-react'
import { api } from '../../api/client'
import type { MedicalRecord } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Card, CardBody } from '../../components/ui/card'
import { RecordList } from './RecordList'

export function HistoryPage() {
  const records = useQuery({ queryKey: ['records'], queryFn: () => api.get<MedicalRecord[]>('/records') })
  return (
    <>
      <PageHeader title="Medical history" description="Diagnoses and prescriptions recorded by your doctors." />
      <p className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Lock className="size-4" aria-hidden /> Only you and your treating doctors can see this.</p>
      <Card>
        <QueryState query={records}>
          {(list) => list.length
            ? <CardBody><RecordList records={list} /></CardBody>
            : <EmptyState icon={History} title="No records yet" description="Your diagnoses and prescriptions will appear here after a visit." />}
        </QueryState>
      </Card>
    </>
  )
}
