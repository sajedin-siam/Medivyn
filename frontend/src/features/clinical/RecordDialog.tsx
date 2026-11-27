import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../api/client'
import type { Appointment } from '../../api/types'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input, Textarea } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'

const recordSchema = z.object({
  diagnosis: z.string().trim().min(3, 'Enter the diagnosis'),
  notes: z.string(),
  prescriptions: z.array(z.object({
    medicine: z.string().trim().min(1, 'Required'),
    dosage: z.string().trim().min(1, 'Required'),
    duration: z.string().trim().min(1, 'Required'),
  })),
})
type RecordForm = z.infer<typeof recordSchema>

export function RecordDialog({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<RecordForm>({
    resolver: zodResolver(recordSchema),
    defaultValues: { diagnosis: '', notes: '', prescriptions: [{ medicine: '', dosage: '', duration: '' }] },
  })
  const rx = useFieldArray({ control, name: 'prescriptions' })
  const save = useAction(
    (v: RecordForm) => api.post(`/appointments/${appointment!.id}/record`, v),
    { success: 'Saved to the patient’s medical history', invalidate: [['appointments'], ['records']], onSuccess: () => { reset(); onClose() } },
  )

  return (
    <Dialog open={!!appointment} onClose={onClose} title={`Diagnosis for ${appointment?.patientName ?? ''}`} wide>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="space-y-4">
        <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">Reason for visit: {appointment?.reason}</p>
        <Field label="Diagnosis" required error={errors.diagnosis?.message}><Input {...register('diagnosis')} /></Field>
        <Field label="Notes and advice"><Textarea {...register('notes')} /></Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-neutral-700">Prescription</legend>
          {rx.fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
              <Field label="Medicine" required error={errors.prescriptions?.[i]?.medicine?.message}><Input {...register(`prescriptions.${i}.medicine`)} /></Field>
              <Field label="Dosage" required error={errors.prescriptions?.[i]?.dosage?.message}><Input placeholder="1 tablet twice daily" {...register(`prescriptions.${i}.dosage`)} /></Field>
              <Field label="Duration" required error={errors.prescriptions?.[i]?.duration?.message}><Input placeholder="7 days" {...register(`prescriptions.${i}.duration`)} /></Field>
              <Button type="button" variant="ghost" size="sm" className="mb-1" onClick={() => rx.remove(i)} aria-label={`Remove medicine ${i + 1}`}><Trash2 className="size-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => rx.append({ medicine: '', dosage: '', duration: '' })}>
            <Plus className="size-4" /> Add medicine
          </Button>
        </fieldset>

        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>Save and complete visit</Button>
        </div>
      </form>
    </Dialog>
  )
}
