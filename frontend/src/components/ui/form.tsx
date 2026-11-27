import { useId, type InputHTMLAttributes, type ReactElement, type SelectHTMLAttributes, type TextareaHTMLAttributes, cloneElement } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/format'

const control = 'w-full rounded-lg border border-neutral-900/15 bg-white px-3 text-[15px] text-neutral-900 transition-[border-color,box-shadow] placeholder:text-neutral-400 hover:border-neutral-900/30 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/15 aria-[invalid=true]:border-red-500 disabled:bg-neutral-100'

/** Label + control + error, wired together for screen readers. */
export function Field({ label, error, hint, required, children, className }: {
  label: string; error?: string; hint?: string; required?: boolean; children: ReactElement<Record<string, unknown>>; className?: string
}) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden>*</span>}
      </label>
      {cloneElement(children, { id, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {hint && !error && <p id={`${id}-hint`} className="text-sm text-neutral-500">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="flex items-center gap-1.5 text-sm font-medium text-red-700"><AlertCircle className="size-4 shrink-0" aria-hidden />{error}</p>}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, 'h-11', className)} />
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(control, 'h-11', className)} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(control, 'min-h-24 py-2.5', className)} />
}
