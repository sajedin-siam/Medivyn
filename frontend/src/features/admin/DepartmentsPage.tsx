import { useQuery } from '@tanstack/react-query'
import { Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { Department } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card, CardBody } from '../../components/ui/card'
import { Input } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'

export function DepartmentsPage() {
  const q = useQuery({ queryKey: ['departments'], queryFn: () => api.get<Department[]>('/admin/departments') })
  const [name, setName] = useState('')
  const add = useAction(() => api.post('/admin/departments', { name: name.trim() }), { success: 'Department added', invalidate: [['departments']], onSuccess: () => setName('') })
  const del = useAction((id: string) => api.del(`/admin/departments/${id}`), { success: 'Department removed', invalidate: [['departments']] })

  return (
    <>
      <PageHeader title="Departments" />
      <Card className="mb-6">
        <CardBody>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add.mutate(undefined) }}>
            <Input aria-label="New department name" placeholder="New department, e.g. Dermatology" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={name.trim().length < 2} loading={add.isPending}>Add</Button>
          </form>
        </CardBody>
      </Card>
      <QueryState query={q}>
        {(list) => list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <Card key={d.id} className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-brand-50 p-2.5 text-brand-700"><Users className="size-5" aria-hidden /></div>
                <div className="flex-1"><p className="font-medium">{d.name}</p><p className="text-sm text-slate-500">{d.doctorCount} doctor{d.doctorCount === 1 ? '' : 's'}</p></div>
                <Button size="sm" variant="ghost" aria-label={`Remove ${d.name}`} disabled={d.doctorCount > 0} title={d.doctorCount > 0 ? 'Move or remove its doctors first' : undefined}
                  onClick={() => confirm(`Remove ${d.name}?`) && del.mutate(d.id)}><Trash2 className="size-4" /></Button>
              </Card>
            ))}
          </div>
        ) : <Card><EmptyState icon={Users} title="No departments" /></Card>}
      </QueryState>
    </>
  )
}
