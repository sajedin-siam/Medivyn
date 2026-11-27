import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/** A mutation that shows a toast and refreshes the given queries when it succeeds. */
export function useAction<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  opts: { success?: string | ((r: TResult) => string); invalidate?: string[][]; onSuccess?: (r: TResult) => void } = {},
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      opts.invalidate?.forEach((key) => qc.invalidateQueries({ queryKey: key }))
      const msg = typeof opts.success === 'function' ? opts.success(result) : opts.success
      if (msg) toast.success(msg)
      opts.onSuccess?.(result)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
