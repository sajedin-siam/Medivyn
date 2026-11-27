import { cn } from '../../lib/format'

export const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary: 'bg-white text-neutral-900 ring-1 ring-neutral-900/15 hover:ring-neutral-900/30 disabled:text-neutral-400',
  ghost: 'text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
}
// sm grows to 44px on touch screens so it stays easy to hit
export const sizes = { sm: 'h-10 px-3.5 text-sm pointer-coarse:h-11', md: 'h-11 px-5 text-[15px]' }

/** Button styling for links, so a link never has to wrap a <button>. */
export const buttonClass = (variant: keyof typeof variants = 'primary', size: keyof typeof sizes = 'md', className?: string) => cn(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,box-shadow,transform] duration-150 not-disabled:hover:-translate-y-px not-disabled:active:translate-y-0 not-disabled:active:scale-[0.98] disabled:cursor-not-allowed',
  variants[variant], sizes[size], className,
)
