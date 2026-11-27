import { useQuery } from '@tanstack/react-query'
import { FileText, Send, Sparkles, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../api/client'
import type { Hospital, MedicalReport } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Field, Select } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { formatDate } from '../../lib/format'

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_MB = 10

function SendDialog({ report, onClose }: { report: MedicalReport | null; onClose: () => void }) {
  const [hospitalId, setHospitalId] = useState('')
  const hospitals = useQuery({ queryKey: ['hospitals', ''], queryFn: () => api.get<Hospital[]>('/hospitals'), enabled: !!report })
  const send = useAction(() => api.post(`/reports/${report!.id}/send`, { hospitalId }), { success: 'Report sent', invalidate: [['reports']], onSuccess: onClose })
  return (
    <Dialog open={!!report} onClose={onClose} title={`Send ${report?.fileName ?? ''}`}>
      <div className="space-y-4">
        <Field label="Hospital">
          <Select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
            <option value="" disabled>Select hospital</option>
            {hospitals.data?.map((h) => <option key={h.id} value={h.id}>{h.name} ({h.area})</option>)}
          </Select>
        </Field>
        <p className="text-xs text-slate-500">Only this hospital will be able to view the report.</p>
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={!hospitalId} loading={send.isPending} onClick={() => send.mutate(undefined)}>Send report</Button></div>
      </div>
    </Dialog>
  )
}

export function ReportsPage() {
  const reports = useQuery({ queryKey: ['reports'], queryFn: () => api.get<MedicalReport[]>('/reports') })
  const fileRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState<MedicalReport | null>(null)
  const upload = useAction((file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post<MedicalReport>('/reports', fd)
  }, { success: 'Report uploaded', invalidate: [['reports']] })

  function onPick(file?: File) {
    if (!file) return
    if (!ALLOWED.includes(file.type)) return toast.error('Only PDF, JPG and PNG files are allowed')
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Files must be under ${MAX_MB} MB`)
    upload.mutate(file)
  }

  return (
    <>
      <PageHeader title="Medical reports" description="Upload copies of your test reports. An AI summary of the key findings is added when available."
        action={<Button loading={upload.isPending} onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Upload report</Button>} />
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = '' }} />
      <QueryState query={reports}>
        {(list) => list.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((r) => (
              <Card key={r.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-accent-50 p-2.5 text-accent-600"><FileText className="size-5" aria-hidden /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.fileName}</p>
                    <p className="text-xs text-slate-500">Uploaded {formatDate(r.uploadedAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex-1 rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-600"><Sparkles className="size-3.5" aria-hidden /> AI summary</p>
                  {r.aiSummary ? <p className="text-slate-700">{r.aiSummary}</p> : <p className="text-slate-500">Summary unavailable right now. Your report is saved and can still be viewed and sent.</p>}
                  <p className="mt-2 text-xs text-slate-400">Assistive only. Not a diagnosis.</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {r.sentTo.map((h) => <Badge key={h} tone="success">Sent to {h}</Badge>)}
                  <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setSending(r)}><Send className="size-4" /> Send to hospital</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : <Card><EmptyState icon={FileText} title="No reports uploaded" description="PDF, JPG or PNG up to 10 MB." /></Card>}
      </QueryState>
      <SendDialog key={sending?.id} report={sending} onClose={() => setSending(null)} />
    </>
  )
}
