import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/format'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('rounded-xl border border-neutral-900/10 bg-white', className)} />
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-900/5 px-6 py-5">
      <div>
        <h2 className="text-lg font-medium text-neutral-900">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('p-6', className)} />
}
