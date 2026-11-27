import { useQuery } from '@tanstack/react-query'
import { BookHeart, CalendarDays, Droplet, FileText, Receipt, Search, Video, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { Appointment, Bill, BloodRequest } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { PageHeader, StatCard } from '../../components/common'
import { buttonClass } from '../../components/ui/buttonClass'
import { Card, CardBody, CardHeader } from '../../components/ui/card'
import { formatDateTime, formatTaka, greeting } from '../../lib/format'

const QUICK: [string, string, LucideIcon][] = [
  ['/patient/doctors', 'Book a doctor', Search],
  ['/patient/blood', 'Request blood', Droplet],
  ['/patient/reports', 'Upload a report', FileText],
  ['/patient/journal', 'Write in journal', BookHeart],
]

export function PatientDashboardPage() {
  const { user } = useAuth()
  const appts = useQuery({ queryKey: ['appointments'], queryFn: () => api.get<Appointment[]>('/appointments') })
  const bills = useQuery({ queryKey: ['bills'], queryFn: () => api.get<Bill[]>('/bills') })
  const blood = useQuery({ queryKey: ['blood-requests'], queryFn: () => api.get<BloodRequest[]>('/blood-requests') })
  const next = appts.data?.find((a) => a.status === 'BOOKED')
  const due = bills.data?.filter((b) => b.status === 'UNPAID').reduce((s, b) => s + b.amount, 0) ?? 0
  const openBlood = blood.data?.filter((b) => b.status === 'OPEN').length ?? 0

  return (
    <>
      <PageHeader title={`${greeting()}, ${user?.name.split(' ')[0]}`} description="Here is what is coming up for you." />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Upcoming appointments" value={appts.data?.filter((a) => a.status === 'BOOKED').length ?? '–'} icon={CalendarDays} to="/patient/appointments" />
          <StatCard label={due ? 'Amount due · pay now' : 'Amount due'} value={formatTaka(due)} icon={Receipt} tone={due ? 'amber' : 'brand'} to="/patient/bills" />
          <StatCard label="Open blood requests" value={openBlood} icon={Droplet} tone="red" to="/patient/blood" />
        </div>

        <Card>
          <CardHeader title="Next appointment" action={<Link to="/patient/appointments" className="text-sm font-medium text-brand-700 hover:underline">All appointments</Link>} />
          <CardBody>
            {next ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-xl bg-brand-50 p-3 text-brand-700">{next.type === 'ONLINE' ? <Video className="size-6" /> : <CalendarDays className="size-6" />}</div>
                <div className="flex-1">
                  <p className="font-semibold">{next.doctorName} · {next.specialty}</p>
                  <p className="text-sm text-neutral-500">{formatDateTime(next.dateTime)} · {next.type === 'ONLINE' ? 'Online session' : 'In person'}</p>
                </div>
                {next.meetingLink && <a href={next.meetingLink} target="_blank" rel="noreferrer" className={buttonClass()}>Join session</a>}
              </div>
            ) : <p className="text-sm text-neutral-500">No upcoming appointments. <Link to="/patient/doctors" className="font-medium text-brand-700 hover:underline">Find a doctor</Link></p>}
          </CardBody>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK.map(([to, label, Icon]) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-5 text-center text-sm font-medium text-neutral-700 shadow-sm hover:border-brand-600 hover:text-brand-800">
              <Icon className="size-6 text-brand-700" aria-hidden />{label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
