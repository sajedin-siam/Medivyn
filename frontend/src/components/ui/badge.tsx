import type { ReactNode } from 'react'
import { cn } from '../../lib/format'

const tones = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-brand-50 text-brand-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-800',
  accent: 'bg-accent-50 text-accent-800',
}
export type Tone = keyof typeof tones

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>{children}</span>
}
