import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { AuditEntry } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/form'
import { Table, Td, Th } from '../../components/ui/table'
import { formatDateTime } from '../../lib/format'

export function AuditPage() {
  const q = useQuery({ queryKey: ['audit'], queryFn: () => api.get<AuditEntry[]>('/admin/audit') })
  const [filter, setFilter] = useState('')
  return (
    <>
      <PageHeader title="Audit history" description="Insert-only record of who changed what and when. Entries cannot be edited or deleted." />
      <Input className="mb-4 max-w-sm" placeholder="Filter by person, action or record" aria-label="Filter audit history" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <Card>
        <QueryState query={q}>
          {(list) => {
            const f = filter.toLowerCase()
            const rows = list.filter((a) => [a.actor, a.action, a.target].some((s) => s.toLowerCase().includes(f)))
            return rows.length ? (
              <Table>
                <thead><tr><Th>When</Th><Th>Who</Th><Th>Action</Th><Th>Record</Th></tr></thead>
                <tbody>{rows.map((a) => (
                  <tr key={a.id}><Td className="whitespace-nowrap text-slate-500">{formatDateTime(a.at)}</Td><Td className="font-medium">{a.actor}</Td><Td>{a.action}</Td><Td>{a.target}</Td></tr>
                ))}</tbody>
              </Table>
            ) : <EmptyState icon={ShieldCheck} title="No matching entries" />
          }}
        </QueryState>
      </Card>
    </>
  )
}
