import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/format'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary: 'bg-white text-neutral-900 ring-1 ring-neutral-900/15 hover:ring-neutral-900/30 disabled:text-neutral-400',
  ghost: 'text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
}
const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-sm' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,box-shadow,transform] duration-150 enabled:hover:-translate-y-px enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:cursor-not-allowed',
        variants[variant], sizes[size], className,
      )}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  )
}
