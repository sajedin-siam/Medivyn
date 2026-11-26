import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

/** Native <dialog>: focus trap, Esc to close and backdrop come from the browser. */
export function Dialog({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal?.()
    if (!open && d.open) d.close?.()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className={`m-auto w-[calc(100%-2rem)] rounded-xl bg-white p-0 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
    >
      {open && (
        <div>
          <div className="flex items-center justify-between border-b border-neutral-900/5 px-6 py-5">
            <h2 id="dialog-title" className="text-lg font-medium">{title}</h2>
            <button onClick={onClose} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
        </div>
      )}
    </dialog>
  )
}
