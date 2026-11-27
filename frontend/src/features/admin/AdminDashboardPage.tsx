import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Droplet, Receipt, Stethoscope } from 'lucide-react'
import { Link } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../../api/client'
import type { AdminSummary } from '../../api/types'
import { PageHeader, QueryState, StatCard, StatusBadge } from '../../components/common'
import { Card, CardBody, CardHeader } from '../../components/ui/card'
import { formatTaka } from '../../lib/format'

export function AdminDashboardPage() {
  const q = useQuery({ queryKey: ['admin-summary'], queryFn: () => api.get<AdminSummary>('/admin/summary') })
  return (
    <>
      <PageHeader title="Hospital overview" description="Summary of appointments, billing, referrals and blood requests." />
      <QueryState query={q}>
        {(s) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Appointments this month" value={s.appointmentsThisMonth} icon={CalendarDays} />
              <StatCard label="Revenue collected" value={formatTaka(s.revenuePaid)} icon={Receipt} tone="accent" to="/admin/billing" />
              <StatCard label="Unpaid bills" value={formatTaka(s.revenueUnpaid)} icon={Receipt} tone="amber" to="/admin/billing" />
              <StatCard label="Open blood requests" value={s.openBloodRequests} icon={Droplet} tone="red" to="/admin/blood" />
            </div>
            {s.pendingDoctors > 0 && (
              <Link to="/admin/doctors" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 hover:bg-amber-100">
                <Stethoscope className="size-5" aria-hidden />
                <span><strong>{s.pendingDoctors}</strong> doctor account{s.pendingDoctors > 1 ? 's are' : ' is'} waiting for approval. Review now →</span>
              </Link>
            )}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader title="Appointments by week" />
                <CardBody>
                  <div className="h-64" role="img" aria-label={`Appointments by week: ${s.appointmentsByWeek.map((w) => `${w.week} ${w.count}`).join(', ')}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={s.appointmentsByWeek} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="count" name="Appointments" fill="#1a4be0" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader title="Referrals" action={<Link to="/admin/referrals" className="text-sm font-medium text-brand-700 hover:underline">View</Link>} />
                <ul className="divide-y divide-neutral-100">
                  {Object.entries(s.referrals).map(([status, n]) => (
                    <li key={status} className="flex items-center justify-between px-5 py-3"><StatusBadge status={status} /><span className="font-semibold">{n}</span></li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </QueryState>
    </>
  )
}
