import { useMutation } from '@tanstack/react-query'
import { Bot, LifeBuoy, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import type { ChatMessage } from '../../api/types'
import { PageHeader } from '../../components/common'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { cn } from '../../lib/format'

const GREETING: ChatMessage = { role: 'assistant', text: 'Hi, I am here to listen. How are you feeling today? You can also ask general questions about sleep, stress or healthy habits.' }
// the model sees only recent context, so each request stays the same size however long the chat runs
const HISTORY_SENT = 20
const SUGGESTIONS = ['I have trouble sleeping', 'I feel stressed about work', 'Tips for a healthier routine']

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const send = useMutation({
    mutationFn: (history: ChatMessage[]) => api.post<ChatMessage>('/chat', { messages: history }),
    onSuccess: (reply) => setMessages((m) => [...m, reply]),
    onError: () => setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, the assistant is unavailable right now. If you need support, please contact your doctor.' }]),
  })
  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth' }) }, [messages, send.isPending])

  function submit(t: string) {
    if (!t.trim() || send.isPending) return
    const history = [...messages, { role: 'user' as const, text: t.trim() }]
    setMessages(history)
    setText('')
    send.mutate(history.slice(-HISTORY_SENT))
  }

  return (
    <>
      <PageHeader title="Wellbeing chat" description="A supportive assistant for everyday worries and general health tips." />
      <Card className="flex h-[calc(100vh-15rem)] min-h-[28rem] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              {m.role === 'assistant' && <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600"><Bot className="size-4" aria-hidden /></div>}
              <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                m.role === 'user' ? 'rounded-tr-sm bg-brand-700 text-white' : m.distress ? 'rounded-tl-sm border border-amber-300 bg-amber-50 text-amber-950' : 'rounded-tl-sm bg-slate-100 text-slate-800')}>
                {m.distress && <p className="mb-1 flex items-center gap-1.5 font-semibold"><LifeBuoy className="size-4" aria-hidden /> You are not alone</p>}
                <p className="whitespace-pre-line">{m.text}</p>
                {m.distress && <Link to="/patient/doctors?q=Psychiatry" className="mt-2 inline-block font-medium text-amber-900 underline">Book an online session</Link>}
              </div>
            </div>
          ))}
          {send.isPending && <p className="pl-11 text-sm text-slate-400">Typing…</p>}
          <div ref={endRef} />
        </div>
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {SUGGESTIONS.map((s) => <button key={s} onClick={() => submit(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-brand-600">{s}</button>)}
          </div>
        )}
        <form className="flex gap-2 border-t border-slate-100 p-3" onSubmit={(e) => { e.preventDefault(); submit(text) }}>
          <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" placeholder="Type how you feel…"
            className="h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20" />
          <Button type="submit" aria-label="Send" disabled={!text.trim() || send.isPending}><SendHorizontal className="size-4" /></Button>
        </form>
      </Card>
      <p className="mt-3 text-center text-xs text-slate-500">The assistant is not a doctor and cannot diagnose. In an emergency call 999.</p>
    </>
  )
}
