import { useQuery } from '@tanstack/react-query'
import { BookHeart, Lock, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../api/client'
import type { Doctor, JournalEntry } from '../../api/types'
import { EmptyState, PageHeader, QueryState } from '../../components/common'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardBody, CardHeader } from '../../components/ui/card'
import { Dialog } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/form'
import { useAction } from '../../hooks/useAction'
import { cn, formatDate } from '../../lib/format'
import { moodLabel } from '../../lib/mood'

function NewEntry() {
  const [mood, setMood] = useState<JournalEntry['mood'] | null>(null)
  const [text, setText] = useState('')
  const save = useAction(() => api.post('/journal', { mood, text }), { success: 'Entry saved privately', invalidate: [['journal']], onSuccess: () => { setMood(null); setText('') } })
  return (
    <Card>
      <CardHeader title="How are you feeling today?" description="Entries are private unless you choose to share them." />
      <CardBody>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(undefined) }}>
          <fieldset>
            <legend className="sr-only">Mood from 1 (very low) to 5 (very good)</legend>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as const).map((m) => (
                <label key={m} className={cn('cursor-pointer rounded-lg border px-1 py-3 text-center text-xs font-medium sm:text-sm', mood === m ? 'border-accent-600 bg-accent-50 text-accent-800' : 'border-slate-200 text-slate-600 hover:border-accent-600')}>
                  <input type="radio" name="mood" className="sr-only" checked={mood === m} onChange={() => setMood(m)} />
                  <span className="block text-2xl" aria-hidden>{moodLabel(m).split(' ')[0]}</span>
                  {moodLabel(m).split(' ').slice(1).join(' ')}
                </label>
              ))}
            </div>
          </fieldset>
          <Textarea aria-label="Journal entry" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write about your day, your thoughts or anything on your mind…" />
          <div className="flex justify-end"><Button type="submit" disabled={!mood || !text.trim()} loading={save.isPending}>Save entry</Button></div>
        </form>
      </CardBody>
    </Card>
  )
}

function ShareDialog({ entry, onClose }: { entry: JournalEntry | null; onClose: () => void }) {
  const doctors = useQuery({ queryKey: ['my-doctors'], queryFn: () => api.get<Doctor[]>('/my-doctors'), enabled: !!entry })
  const update = useAction((sharedWith: string[]) => api.put(`/journal/${entry!.id}`, { sharedWith }), { invalidate: [['journal']] })
  const [shared, setShared] = useState<string[]>(entry?.sharedWith ?? [])
  return (
    <Dialog open={!!entry} onClose={onClose} title="Share with a doctor">
      <p className="mb-4 text-sm text-slate-600">Only the doctors you tick can read this entry. You can stop sharing at any time.</p>
      <div className="space-y-2">
        {doctors.data?.length ? doctors.data.map((d) => (
          <label key={d.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <input type="checkbox" className="size-4 accent-brand-700" checked={shared.includes(d.id)}
              onChange={(e) => setShared((s) => (e.target.checked ? [...s, d.id] : s.filter((x) => x !== d.id)))} />
            <span><span className="block text-sm font-medium">{d.name}</span><span className="block text-xs text-slate-500">{d.specialty}</span></span>
          </label>
        )) : <p className="text-sm text-slate-500">You can share with doctors you have an appointment with.</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={update.isPending} onClick={() => update.mutate(shared, { onSuccess: onClose })}>Save sharing</Button>
      </div>
    </Dialog>
  )
}

export function JournalPage() {
  const journal = useQuery({ queryKey: ['journal'], queryFn: () => api.get<JournalEntry[]>('/journal') })
  const [sharing, setSharing] = useState<JournalEntry | null>(null)
  const del = useAction((id: string) => api.del(`/journal/${id}`), { success: 'Entry deleted', invalidate: [['journal']] })

  return (
    <>
      <PageHeader title="My journal" description="A private space to track your mood and thoughts." />
      <div className="space-y-6">
        <NewEntry />
        <QueryState query={journal}>
          {(list) => list.length ? (
            <ul className="space-y-3">
              {list.map((e) => (
                <Card key={e.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{moodLabel(e.mood)}</span>
                    <span className="text-sm text-slate-500">· {formatDate(e.date)}</span>
                    <span className="ml-auto">
                      {e.sharedWith.length
                        ? <Badge tone="accent">Shared with {e.sharedWith.length} doctor{e.sharedWith.length > 1 ? 's' : ''}</Badge>
                        : <Badge><Lock className="mr-1 size-3" aria-hidden /> Private</Badge>}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-slate-700">{e.text}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSharing(e)}><Share2 className="size-4" /> Sharing</Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm('Delete this entry?') && del.mutate(e.id)}><Trash2 className="size-4" /> Delete</Button>
                  </div>
                </Card>
              ))}
            </ul>
          ) : <Card><EmptyState icon={BookHeart} title="No entries yet" description="Write your first entry above." /></Card>}
        </QueryState>
      </div>
      <ShareDialog key={sharing?.id ?? 'none'} entry={sharing} onClose={() => setSharing(null)} />
    </>
  )
}
