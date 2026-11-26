import { useQuery } from '@tanstack/react-query'
import { Activity } from 'lucide-react'
import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../../api/client'
import type { SharedJournalEntry } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Card, CardBody, CardHeader } from '../../components/ui/card'
import { Field, Select } from '../../components/ui/form'
import { formatDate } from '../../lib/format'
import { moodLabel } from '../../lib/mood'

export function MoodChart({ entries }: { entries: SharedJournalEntry[] }) {
  const data = entries.map((e) => ({ date: formatDate(e.date), mood: e.mood }))
  return (
    <figure>
      <div className="h-64" role="img" aria-label={`Mood trend: ${data.map((d) => `${d.date} mood ${d.mood}`).join(', ')}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip formatter={(v) => [moodLabel(Number(v)), 'Mood']} />
            <Line type="monotone" dataKey="mood" stroke="#1a4be0" strokeWidth={2.5} dot={{ r: 4, fill: '#1a4be0' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">Mood scale: 1 very low, 5 very good. Only entries the patient chose to share are shown.</figcaption>
    </figure>
  )
}

export function DoctorJournalsPage() {
  const q = useQuery({ queryKey: ['shared-journal'], queryFn: () => api.get<SharedJournalEntry[]>('/doctor/shared-journal') })
  const [patient, setPatient] = useState('')
  return (
    <>
      <PageHeader title="Shared journals" description="Mood trends from entries your patients chose to share with you." />
      <QueryState query={q}>
        {(all) => {
          const patients = [...new Map(all.map((e) => [e.patientId, e.patientName])).entries()]
          const selected = patient || patients[0]?.[0]
          const entries = all.filter((e) => e.patientId === selected)
          if (!patients.length) return <Card><EmptyState icon={Activity} title="No shared entries" description="Patients can share journal entries with you from their journal." /></Card>
          return (
            <div className="space-y-6">
              {patients.length > 1 && (
                <Field label="Patient" className="max-w-xs">
                  <Select value={selected} onChange={(e) => setPatient(e.target.value)}>{patients.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</Select>
                </Field>
              )}
              <Card>
                <CardHeader title={`Mood trend: ${entries[0]?.patientName}`} description={`${entries.length} shared entries`} />
                <CardBody><MoodChart entries={entries} /></CardBody>
              </Card>
              <Card>
                <CardHeader title="Entries" />
                <ul className="divide-y divide-slate-100">
                  {[...entries].reverse().map((e) => (
                    <li key={e.id} className="px-5 py-4">
                      <p className="text-sm"><span className="font-medium">{moodLabel(e.mood)}</span> <span className="text-slate-500">· {formatDate(e.date)}</span></p>
                      <p className="mt-1 text-slate-700">{e.text}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )
        }}
      </QueryState>
    </>
  )
}
