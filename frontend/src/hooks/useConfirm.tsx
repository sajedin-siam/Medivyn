import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'

type Request = { question: string; action: string; onYes: () => void; danger: boolean }

/** In-app replacement for window.confirm(): render `dialog` once, then call `ask(...)` from a click. */
export function useConfirm() {
  const [req, setReq] = useState<Request | null>(null)
  const close = () => setReq(null)
  const dialog = (
    <Dialog open={!!req} onClose={close} title={req?.question ?? ''}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={close}>Go back</Button>
        <Button variant={req?.danger ? 'danger' : 'primary'} onClick={() => { req?.onYes(); close() }}>{req?.action}</Button>
      </div>
    </Dialog>
  )
  const ask = (question: string, action: string, onYes: () => void, danger = true) => setReq({ question, action, onYes, danger })
  return [dialog, ask] as const
}
