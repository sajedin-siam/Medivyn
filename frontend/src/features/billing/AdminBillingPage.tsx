import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Plus, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../api/client'
import type { Bill, User } from '../../api/types'
import { EmptyState, PageHeader, QueryState, StatusBadge } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input, Select } from '../../components/ui/form'
import { Table, Td, Th } from '../../components/ui/table'
import { useAction } from '../../hooks/useAction'
import { formatDate, formatTaka } from '../../lib/format'

const billSchema = z.object({
  patientId: z.string().min(1, 'Choose a patient'),
  description: z.string().trim().min(3, 'Describe the service'),
  amount: z.coerce.number<string>().positive('Amount must be more than 0'),
})
type BillForm = z.output<typeof billSchema>

function CreateBillDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const patients = useQuery({ queryKey: ['patients'], queryFn: () => api.get<User[]>('/admin/patients'), enabled: open })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.input<typeof billSchema>, unknown, BillForm>({ resolver: zodResolver(billSchema) })
  const create = useAction((v: BillForm) => api.post('/admin/bills', v), { success: 'Bill created and patient notified', invalidate: [['bills']], onSuccess: () => { reset(); onClose() } })
  return (
    <Dialog open={open} onClose={onClose} title="Create bill">
      <form onSubmit={handleSubmit((v) => create.mutate(v))} noValidate className="space-y-4">
        <Field label="Patient" error={errors.patientId?.message}>
          <Select defaultValue="" {...register('patientId')}>
            <option value="" disabled>Select patient</option>
            {patients.data?.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
          </Select>
        </Field>
        <Field label="Service" error={errors.description?.message}><Input placeholder="e.g. Cardiology consultation" {...register('description')} /></Field>
        <Field label="Amount (৳)" error={errors.amount?.message}><Input type="number" min="1" inputMode="numeric" {...register('amount')} /></Field>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={create.isPending}>Create bill</Button></div>
      </form>
    </Dialog>
  )
}

export function AdminBillingPage() {
  const bills = useQuery({ queryKey: ['bills'], queryFn: () => api.get<Bill[]>('/bills') })
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL')
  return (
    <>
      <PageHeader title="Billing" description="Create bills for appointments and track payments." action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Create bill</Button>} />
      <div className="mb-4 flex gap-2" role="group" aria-label="Filter bills">
        {(['ALL', 'UNPAID', 'PAID'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'primary' : 'secondary'} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'ALL' ? 'All' : f === 'PAID' ? 'Paid' : 'Unpaid'}</Button>
        ))}
      </div>
      <Card>
        <QueryState query={bills}>
          {(list) => {
            const rows = list.filter((b) => filter === 'ALL' || b.status === filter)
            return rows.length ? (
              <Table>
                <thead><tr><Th>Date</Th><Th>Patient</Th><Th>Service</Th><Th>Amount</Th><Th>Status</Th></tr></thead>
                <tbody>{rows.map((b) => (
                  <tr key={b.id}><Td>{formatDate(b.createdAt)}</Td><Td className="font-medium">{b.patientName}</Td><Td>{b.description}</Td><Td>{formatTaka(b.amount)}</Td><Td><StatusBadge status={b.status} /></Td></tr>
                ))}</tbody>
              </Table>
            ) : <EmptyState icon={Receipt} title="No bills" />
          }}
        </QueryState>
      </Card>
      <CreateBillDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
