import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { Appointment } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card, CardHeader } from '../../components/ui/card'
import { useAction } from '../../hooks/useAction'
import { AppointmentItem } from './AppointmentItem'

export function PatientAppointmentsPage() {
  const appts = useQuery({ queryKey: ['appointments'], queryFn: () => api.get<Appointment[]>('/appointments') })
  const cancel = useAction((id: string) => api.post(`/appointments/${id}/cancel`), { success: 'Appointment cancelled', invalidate: [['appointments'], ['slots']] })

  return (
    <>
      <PageHeader title="My appointments" action={<Link to="/patient/doctors"><Button>Book new</Button></Link>} />
      <QueryState query={appts}>
        {(list) => {
          const upcoming = list.filter((a) => a.status === 'BOOKED')
          const past = list.filter((a) => a.status !== 'BOOKED').reverse()
          return (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Upcoming" />
                {upcoming.length ? (
                  <ul className="divide-y divide-slate-100">
                    {upcoming.map((a) => (
                      <AppointmentItem key={a.id} a={a} who={`${a.doctorName} · ${a.specialty}`} actions={<>
                        {a.meetingLink && <a href={a.meetingLink} target="_blank" rel="noreferrer"><Button size="sm">Join session</Button></a>}
                        <Button size="sm" variant="secondary" loading={cancel.isPending && cancel.variables === a.id}
                          onClick={() => confirm('Cancel this appointment?') && cancel.mutate(a.id)}>Cancel</Button>
                      </>} />
                    ))}
                  </ul>
                ) : <EmptyState icon={CalendarDays} title="No upcoming appointments" action={<Link to="/patient/doctors" className="text-sm font-medium text-brand-700 hover:underline">Find a doctor</Link>} />}
              </Card>
              {past.length > 0 && (
                <Card>
                  <CardHeader title="Past and cancelled" />
                  <ul className="divide-y divide-slate-100">{past.map((a) => <AppointmentItem key={a.id} a={a} who={`${a.doctorName} · ${a.specialty}`} />)}</ul>
                </Card>
              )}
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
