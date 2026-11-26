import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { Appointment, MedicalRecord } from '../../api/types'
import { EmptyState, PageHeader, QueryState, Spinner } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card, CardHeader } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { isToday } from '../../lib/format'
import { RecordDialog } from '../clinical/RecordDialog'
import { RecordList } from '../clinical/RecordList'
import { AppointmentItem } from './AppointmentItem'

function PatientHistoryDialog({ patient, onClose }: { patient: { id: string; name: string } | null; onClose: () => void }) {
  const q = useQuery({ queryKey: ['patient-records', patient?.id], queryFn: () => api.get<MedicalRecord[]>(`/patients/${patient!.id}/records`), enabled: !!patient })
  return (
    <Dialog open={!!patient} onClose={onClose} title={`History: ${patient?.name ?? ''}`} wide>
      {q.isPending ? <Spinner /> : q.data?.length ? <RecordList records={q.data} /> : <p className="text-sm text-slate-500">No previous records.</p>}
    </Dialog>
  )
}

export function DoctorAppointmentsPage() {
  const appts = useQuery({ queryKey: ['appointments'], queryFn: () => api.get<Appointment[]>('/appointments') })
  const [recording, setRecording] = useState<Appointment | null>(null)
  const [history, setHistory] = useState<{ id: string; name: string } | null>(null)

  const actions = (a: Appointment) => <>
    {a.meetingLink && <a href={a.meetingLink} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary">Start session</Button></a>}
    <Button size="sm" variant="secondary" onClick={() => setHistory({ id: a.patientId, name: a.patientName })}>History</Button>
    <Link to={`/doctor/referrals?patient=${a.patientId}`}><Button size="sm" variant="secondary">Refer</Button></Link>
    <Button size="sm" onClick={() => setRecording(a)}>Record diagnosis</Button>
  </>

  return (
    <>
      <PageHeader title="Appointments" description="Record diagnoses and prescriptions, view history or refer a patient." />
      <QueryState query={appts}>
        {(list) => {
          const open = list.filter((a) => a.status === 'BOOKED')
          const groups: [string, Appointment[]][] = [
            ['Today', open.filter((a) => isToday(a.dateTime))],
            ['Upcoming', open.filter((a) => !isToday(a.dateTime))],
            ['Completed', list.filter((a) => a.status === 'COMPLETED').reverse()],
          ]
          return list.length ? (
            <div className="space-y-6">
              {groups.filter(([, items]) => items.length).map(([title, items]) => (
                <Card key={title}>
                  <CardHeader title={title} description={`${items.length} appointment${items.length > 1 ? 's' : ''}`} />
                  <ul className="divide-y divide-slate-100">
                    {items.map((a) => <AppointmentItem key={a.id} a={a} who={a.patientName} actions={a.status === 'BOOKED' ? actions(a) : undefined} />)}
                  </ul>
                </Card>
              ))}
            </div>
          ) : <Card><EmptyState icon={CalendarDays} title="No appointments yet" /></Card>
        }}
      </QueryState>
      <RecordDialog appointment={recording} onClose={() => setRecording(null)} />
      <PatientHistoryDialog patient={history} onClose={() => setHistory(null)} />
    </>
  )
}
