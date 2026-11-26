import { useQuery } from '@tanstack/react-query'
import { MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { api } from '../../api/client'
import type { Appointment, Hospital, Referral } from '../../api/types'
import { EmptyState, PageHeader, QueryState, Spinner, StatusBadge } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardHeader } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Field, Select, Textarea } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { cn, formatDate } from '../../lib/format'
import { SERVICES } from './services'

export function HospitalOption({ h, selected, onSelect }: { h: Hospital; selected?: boolean; onSelect?: () => void }) {
  return (
    <button type="button" onClick={onSelect} disabled={!h.acceptsReferrals} aria-pressed={selected}
      className={cn('w-full rounded-lg border p-3 text-left disabled:cursor-not-allowed disabled:opacity-50', selected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-brand-600')}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{h.name}</p>
        <StatusBadge status={h.capacity} />
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="size-3.5" aria-hidden /> {h.area} · {h.distanceKm} km{!h.acceptsReferrals && ' · not accepting referrals'}</p>
    </button>
  )
}

function NewReferralDialog({ open, onClose, initialPatient, preset }: {
  open: boolean; onClose: () => void; initialPatient?: string; preset?: { patientId: string; service: string; reason: string }
}) {
  const [patientId, setPatientId] = useState(preset?.patientId ?? initialPatient ?? '')
  const [service, setService] = useState(preset?.service ?? '')
  const [hospitalId, setHospitalId] = useState('')
  const [reason, setReason] = useState(preset?.reason ?? '')

  const appts = useQuery({ queryKey: ['appointments'], queryFn: () => api.get<Appointment[]>('/appointments'), enabled: open })
  const patients = [...new Map(appts.data?.map((a) => [a.patientId, a.patientName])).entries()]
  const hospitals = useQuery({ queryKey: ['hospitals', service], queryFn: () => api.get<Hospital[]>(`/hospitals?service=${encodeURIComponent(service)}`), enabled: open && !!service })
  const send = useAction(() => api.post('/referrals', { patientId, hospitalId, service, reason }), { success: 'Referral sent', invalidate: [['referrals']], onSuccess: onClose })

  return (
    <Dialog open={open} onClose={onClose} title="New referral" wide>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); send.mutate(undefined) }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient">
            <Select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="" disabled>Select patient</option>
              {patients.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </Select>
          </Field>
          <Field label="Required service">
            <Select value={service} onChange={(e) => { setService(e.target.value); setHospitalId('') }} required>
              <option value="" disabled>Select service</option>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
        {service && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Hospitals offering {service} (nearest first)</legend>
            {hospitals.isPending ? <Spinner /> : hospitals.data?.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {hospitals.data.map((h) => <HospitalOption key={h.id} h={h} selected={hospitalId === h.id} onSelect={() => setHospitalId(h.id)} />)}
              </div>
            ) : <p className="text-sm text-slate-500">No hospital offers this service.</p>}
          </fieldset>
        )}
        <Field label="Reason and clinical summary"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} required /></Field>
        <p className="text-xs text-slate-500">If the hospital accepts, the patient’s medical reports are sent to it automatically.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!patientId || !hospitalId || !reason.trim()} loading={send.isPending}><Send className="size-4" /> Send referral</Button>
        </div>
      </form>
    </Dialog>
  )
}

function AlternativesDialog({ referral, onClose, onPick }: { referral: Referral | null; onClose: () => void; onPick: (r: Referral) => void }) {
  const alt = useQuery({ queryKey: ['alternatives', referral?.id], queryFn: () => api.get<Hospital[]>(`/referrals/${referral!.id}/alternatives`), enabled: !!referral })
  return (
    <Dialog open={!!referral} onClose={onClose} title="Alternative hospitals">
      <p className="mb-3 text-sm text-slate-600">Hospitals offering {referral?.service}, ranked by capacity and distance.</p>
      {alt.isPending ? <Spinner /> : alt.data?.length ? (
        <div className="space-y-2">{alt.data.map((h) => <HospitalOption key={h.id} h={h} />)}</div>
      ) : <p className="text-sm text-slate-500">No alternatives found.</p>}
      <div className="mt-4 flex justify-end"><Button onClick={() => referral && onPick(referral)}>Create new referral</Button></div>
    </Dialog>
  )
}

export function DoctorReferralsPage() {
  const [params] = useSearchParams()
  const [open, setOpen] = useState(!!params.get('patient'))
  const [preset, setPreset] = useState<{ patientId: string; service: string; reason: string } | undefined>()
  const [alternativesFor, setAlternativesFor] = useState<Referral | null>(null)
  const refs = useQuery({ queryKey: ['referrals'], queryFn: () => api.get<Referral[]>('/referrals') })

  return (
    <>
      <PageHeader title="Referrals" description="Refer patients to other hospitals and track the response." action={<Button onClick={() => { setPreset(undefined); setOpen(true) }}><Send className="size-4" /> New referral</Button>} />
      <Card>
        <CardHeader title="Sent referrals" />
        <QueryState query={refs}>
          {(list) => list.length ? (
            <ul className="divide-y divide-slate-100">
              {list.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{r.patientName} → {r.hospitalName}</p>
                    <p className="text-sm text-slate-500"><Badge tone="accent">{r.service}</Badge> <span className="ml-1">{formatDate(r.createdAt)}</span></p>
                    <p className="mt-1 text-sm text-slate-600">{r.reason}</p>
                    {r.responseNote && <p className="mt-1 text-sm text-slate-800">Hospital: “{r.responseNote}”</p>}
                  </div>
                  <StatusBadge status={r.status} />
                  {(r.status === 'DECLINED' || r.status === 'MORE_INFO_NEEDED') && (
                    <Button size="sm" variant="secondary" onClick={() => setAlternativesFor(r)}>See alternatives</Button>
                  )}
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Send} title="No referrals sent yet" />}
        </QueryState>
      </Card>
      {open && <NewReferralDialog open onClose={() => setOpen(false)} initialPatient={params.get('patient') ?? undefined} preset={preset} />}
      <AlternativesDialog referral={alternativesFor} onClose={() => setAlternativesFor(null)}
        onPick={(r) => { setAlternativesFor(null); setPreset({ patientId: r.patientId, service: r.service, reason: r.reason }); setOpen(true) }} />
    </>
  )
}
