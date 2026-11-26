import { useQuery } from '@tanstack/react-query'
import { Video, Building } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { Appointment, AppointmentType, Doctor } from '../../api/types'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input, Textarea } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { cn, formatTaka, formatTime, localDate } from '../../lib/format'

const today = () => localDate()

export function BookDialog({ doctor, onClose }: { doctor: Doctor | null; onClose: () => void }) {
  const [date, setDate] = useState(today())
  const [slot, setSlot] = useState<string | null>(null)
  const [type, setType] = useState<AppointmentType>('IN_PERSON')
  const [reason, setReason] = useState('')

  const slots = useQuery({
    queryKey: ['slots', doctor?.id, date],
    queryFn: () => api.get<string[]>(`/doctors/${doctor!.id}/slots?date=${date}`),
    enabled: !!doctor,
  })
  const book = useAction(
    () => api.post<Appointment>('/appointments', { doctorId: doctor!.id, dateTime: slot, type, reason }),
    {
      success: 'Appointment booked',
      invalidate: [['appointments'], ['slots']],
      onSuccess: () => { setSlot(null); setReason(''); onClose() },
    },
  )

  return (
    <Dialog open={!!doctor} onClose={onClose} title={doctor ? `Book with ${doctor.name}` : ''}>
      {doctor && (
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); book.mutate(undefined) }}>
          <p className="text-sm text-slate-600">{doctor.specialty} · {doctor.hospital} · Fee {formatTaka(doctor.fee)}</p>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Visit type</legend>
            <div className="grid grid-cols-2 gap-2">
              {([['IN_PERSON', 'In person', Building], ['ONLINE', 'Online session', Video]] as const).map(([v, label, Icon]) => (
                <label key={v} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium', type === v ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600')}>
                  <input type="radio" name="type" className="sr-only" checked={type === v} onChange={() => setType(v)} />
                  <Icon className="size-4" aria-hidden /> {label}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Date">
            <Input type="date" min={today()} value={date} onChange={(e) => { setDate(e.target.value); setSlot(null) }} />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Available times</legend>
            {slots.isPending ? <p className="text-sm text-slate-500">Loading times…</p> : slots.data?.length ? (
              <div className="grid grid-cols-4 gap-2">
                {slots.data.map((s) => (
                  <button type="button" key={s} onClick={() => setSlot(s)} aria-pressed={slot === s}
                    className={cn('rounded-lg border px-2 py-2 text-sm', slot === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 hover:border-brand-600')}>
                    {formatTime(s)}
                  </button>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">No free times on this day. Try another date.</p>}
          </fieldset>

          <Field label="Reason for visit">
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your symptoms" required />
          </Field>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!slot || !reason.trim()} loading={book.isPending}>Confirm booking</Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
