import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '../../lib/format'

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table {...props} className={cn('w-full text-left text-sm', className)} />
    </div>
  )
}
export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" {...props} className={cn('border-b border-neutral-900/10 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-500', className)} />
}
export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn('border-b border-neutral-900/5 px-4 py-3 align-middle', className)} />
}
