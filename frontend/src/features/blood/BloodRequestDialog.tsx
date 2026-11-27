import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { api } from '../../api/client'
import { BLOOD_GROUPS } from '../../api/types'
import { Button } from '../../components/ui/button'
import { Dialog } from '../../components/ui/dialog'
import { Field, Input, Select } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { bloodRequestSchema, type BloodRequestForm, type BloodRequestInput } from './schemas'

export function BloodRequestDialog({ open, onClose, defaultHospital }: { open: boolean; onClose: () => void; defaultHospital?: string }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BloodRequestInput, unknown, BloodRequestForm>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: { units: '1', urgent: false, hospital: defaultHospital ?? '', area: '' },
  })
  const post = useAction((v: BloodRequestForm) => api.post('/blood-requests', v), {
    success: 'Request posted. Matching donors are being notified.',
    invalidate: [['blood-requests']],
    onSuccess: () => { reset(); onClose() },
  })

  return (
    <Dialog open={open} onClose={onClose} title="Request blood">
      <form onSubmit={handleSubmit((v) => post.mutate(v))} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Blood group" required error={errors.bloodGroup?.message}>
            <Select defaultValue="" {...register('bloodGroup')}><option value="" disabled>Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</Select>
          </Field>
          <Field label="Units (bags)" required error={errors.units?.message}><Input type="number" min="1" max="10" {...register('units')} /></Field>
        </div>
        <Field label="Hospital" required error={errors.hospital?.message}><Input {...register('hospital')} /></Field>
        <Field label="Area" required error={errors.area?.message} hint="Used to find nearby donors."><Input placeholder="e.g. Dhanmondi" {...register('area')} /></Field>
        <label className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <input type="checkbox" className="size-4 accent-red-600" {...register('urgent')} />
          <span><span className="font-medium text-red-800">Urgent</span><span className="block text-xs text-red-700">Needed within the next few hours.</span></span>
        </label>
        <p className="text-xs text-neutral-500">Compatible, available donors nearby are ranked and notified. Reminders stop as soon as a donor accepts. Donor locations are never shown.</p>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" variant="danger" loading={post.isPending}>Post request</Button></div>
      </form>
    </Dialog>
  )
}
