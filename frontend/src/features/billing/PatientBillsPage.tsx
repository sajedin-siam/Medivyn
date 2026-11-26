import { useQuery } from '@tanstack/react-query'
import { Banknote, CreditCard, Receipt, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { Bill, PaymentMethod } from '../../api/types'
import { EmptyState, PageHeader, QueryState, StatCard, StatusBadge } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Table, Td, Th } from '../../components/ui/table'
import { useAction } from '../../hooks/useAction'
import { cn, formatDate, formatTaka, humanize } from '../../lib/format'

const METHODS = [
  { value: 'MOBILE', label: 'bKash', note: 'You will be sent to bKash to approve the payment.', icon: Smartphone },
  { value: 'CARD', label: 'Card', note: 'Secure card payment through SSLCommerz.', icon: CreditCard },
  { value: 'CASH', label: 'Cash at counter', note: 'Pay at the hospital billing counter. Staff will mark it paid.', icon: Banknote },
] as const

function PayDialog({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  const [method, setMethod] = useState<PaymentMethod>('MOBILE')
  const pay = useAction(
    () => api.post<Bill & { redirectUrl?: string }>(`/bills/${bill!.id}/pay`, { method }),
    {
      success: 'Payment complete',
      invalidate: [['bills']],
      // live mode: the backend returns the payment gateway page for card / bKash
      onSuccess: (r) => { if (r.redirectUrl) window.location.href = r.redirectUrl; else onClose() },
    },
  )
  return (
    <Dialog open={!!bill} onClose={onClose} title="Pay bill">
      {bill && (
        <div className="space-y-5">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{bill.description}</p>
            <p className="text-2xl font-semibold">{formatTaka(bill.amount)}</p>
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-slate-700">Payment method</legend>
            {METHODS.map((m) => (
              <label key={m.value} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3', method === m.value ? 'border-brand-600 bg-brand-50' : 'border-slate-200')}>
                <input type="radio" name="method" className="mt-1 accent-brand-700" checked={method === m.value} onChange={() => setMethod(m.value)} />
                <m.icon className="mt-0.5 size-5 text-slate-600" aria-hidden />
                <span><span className="block text-sm font-medium">{m.label}</span><span className="block text-xs text-slate-500">{m.note}</span></span>
              </label>
            ))}
          </fieldset>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button loading={pay.isPending} onClick={() => pay.mutate(undefined)}>Pay {formatTaka(bill.amount)}</Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}

export function PatientBillsPage() {
  const bills = useQuery({ queryKey: ['bills'], queryFn: () => api.get<Bill[]>('/bills') })
  const [paying, setPaying] = useState<Bill | null>(null)
  return (
    <>
      <PageHeader title="Bills and payments" />
      <QueryState query={bills}>
        {(list) => {
          const due = list.filter((b) => b.status === 'UNPAID').reduce((s, b) => s + b.amount, 0)
          return (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <StatCard label="Amount due" value={formatTaka(due)} icon={Receipt} tone={due ? 'amber' : 'brand'} />
                <StatCard label="Bills paid" value={list.filter((b) => b.status === 'PAID').length} icon={Receipt} />
              </div>
              <Card>
                {list.length ? (
                  <Table>
                    <thead><tr><Th>Date</Th><Th>Description</Th><Th>Amount</Th><Th>Status</Th><Th><span className="sr-only">Action</span></Th></tr></thead>
                    <tbody>
                      {list.map((b) => (
                        <tr key={b.id}>
                          <Td>{formatDate(b.createdAt)}</Td>
                          <Td className="font-medium">{b.description}</Td>
                          <Td>{formatTaka(b.amount)}</Td>
                          <Td><StatusBadge status={b.status} />{b.paidWith && <span className="ml-2 text-xs text-slate-500">{humanize(b.paidWith)}</span>}</Td>
                          <Td className="text-right">{b.status === 'UNPAID' && <Button size="sm" onClick={() => setPaying(b)}>Pay now</Button>}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : <EmptyState icon={Receipt} title="No bills yet" />}
              </Card>
            </>
          )
        }}
      </QueryState>
      <PayDialog bill={paying} onClose={() => setPaying(null)} />
    </>
  )
}
