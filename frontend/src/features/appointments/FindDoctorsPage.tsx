import { useQuery } from '@tanstack/react-query'
import { Search, Stethoscope } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { useSearchParams } from 'react-router'
import { api } from '../../api/client'
import type { Doctor } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/form'
import { formatTaka } from '../../lib/format'
import { BookDialog } from './BookDialog'

export function FindDoctorsPage() {
  const [params] = useSearchParams()
  const [term, setTerm] = useState(params.get('q') ?? '')
  const q = useDeferredValue(term)
  const [booking, setBooking] = useState<Doctor | null>(null)
  const doctors = useQuery({ queryKey: ['doctors', q], queryFn: () => api.get<Doctor[]>(`/doctors?q=${encodeURIComponent(q)}`) })

  return (
    <>
      <PageHeader title="Find a doctor" description="Search by name, specialty or department, then book in person or online." />
      <div className="relative mb-6 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" aria-hidden />
        <Input className="pl-9" placeholder="e.g. Cardiology, Dr. Farhana" value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Search doctors" />
      </div>
      <QueryState query={doctors}>
        {(list) => list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <Card key={d.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">
                    {d.name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <Badge tone="accent" className="mt-1">{d.specialty}</Badge>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">{d.hospital}</p>
                <p className="text-sm text-slate-600">Consultation fee: <span className="font-medium text-slate-900">{formatTaka(d.fee)}</span></p>
                <Button className="mt-4" onClick={() => setBooking(d)}>Book appointment</Button>
              </Card>
            ))}
          </div>
        ) : <Card><EmptyState icon={Stethoscope} title="No doctors found" description="Try a different name or specialty." /></Card>}
      </QueryState>
      <BookDialog doctor={booking} onClose={() => setBooking(null)} />
    </>
  )
}
