import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/format'

const tones = {
  neutral: 'bg-neutral-100 text-neutral-700',
  success: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/25',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  info: 'bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-600/20',
  accent: 'bg-accent-50 text-accent-800 ring-1 ring-inset ring-accent-600/20',
}
export type Tone = keyof typeof tones

export function Badge({ tone = 'neutral', icon: Icon, children, className }: { tone?: Tone; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium', tones[tone], className)}>
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
      {children}
    </span>
  )
}
