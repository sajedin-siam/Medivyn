import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { api } from '../../api/client'
import { BLOOD_GROUPS } from '../../api/types'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Field, Input, Select } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { Logo } from '../../layouts/AppLayout'
import { registerSchema, type RegisterForm } from './schemas'

export function RegisterPage() {
  const [done, setDone] = useState<{ pending: boolean } | null>(null)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'PATIENT' },
  })
  const role = watch('role')
  const submit = useAction(
    ({ confirm: _c, ...body }: RegisterForm) => api.post<{ pending: boolean }>('/accounts/register', body),
    { onSuccess: (r) => setDone(r) },
  )

  return (
    <div className="grid min-h-screen place-items-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center"><Link to="/"><Logo /></Link></div>
        <Card className="p-8">
          {done ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto size-12 text-brand-600" />
              <h1 className="mt-3 text-3xl font-medium">Account created</h1>
              <p className="mt-2 text-neutral-600">
                {done.pending
                  ? 'Your doctor account is pending. A hospital admin will review it, and you can sign in once it is approved.'
                  : 'You can now sign in.'}
              </p>
              <Link to="/login" className="mt-6 inline-block font-medium text-brand-700 hover:underline">Go to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit((v) => submit.mutate(v))} noValidate className="space-y-4">
              <h1 className="text-3xl font-medium">Create your account</h1>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-neutral-700">I am a</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['PATIENT', 'DONOR', 'DOCTOR'] as const).map((r) => (
                    <label key={r} className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600 ${role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-neutral-900/10 text-neutral-600 hover:border-neutral-900/30'}`}>
                      <input type="radio" value={r} {...register('role')} className="sr-only" />
                      {r === 'PATIENT' ? 'Patient' : r === 'DONOR' ? 'Blood donor' : 'Doctor'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="Full name" error={errors.name?.message}><Input autoComplete="name" {...register('name')} /></Field>
              <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></Field>
              {role === 'DONOR' && (
                <Field label="Blood group" error={errors.bloodGroup?.message} hint="Your location is only used for matching and is never shown to anyone.">
                  <Select {...register('bloodGroup')} defaultValue=""><option value="" disabled>Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</Select>
                </Field>
              )}
              {role === 'DOCTOR' && (
                <Field label="Specialty" error={errors.specialty?.message} hint="Doctor accounts stay pending until a hospital admin approves them.">
                  <Input placeholder="e.g. Cardiology" {...register('specialty')} />
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register('password')} /></Field>
                <Field label="Confirm password" error={errors.confirm?.message}><Input type="password" autoComplete="new-password" {...register('confirm')} /></Field>
              </div>
              <Button type="submit" className="w-full" loading={submit.isPending}>Create account</Button>
              <p className="text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link></p>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
