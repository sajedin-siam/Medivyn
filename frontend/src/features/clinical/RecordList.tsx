import { Pill } from 'lucide-react'
import type { MedicalRecord } from '../../api/types'
import { formatDate } from '../../lib/format'

export function RecordList({ records }: { records: MedicalRecord[] }) {
  return (
    <ol className="relative space-y-6 border-l-2 border-brand-100 pl-6">
      {records.map((r) => (
        <li key={r.id} className="relative">
          <span className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-white bg-brand-600" aria-hidden />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{formatDate(r.date)} · {r.doctorName}</p>
          <p className="mt-1 font-semibold">{r.diagnosis}</p>
          {r.notes && <p className="mt-1 text-sm text-slate-600">{r.notes}</p>}
          {r.prescriptions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {r.prescriptions.map((p, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <Pill className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden />
                  <span><span className="font-medium">{p.medicine}</span> · {p.dosage} · {p.duration}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
