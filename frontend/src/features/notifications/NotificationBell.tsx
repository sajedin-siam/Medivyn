import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../api/client'
import type { AppNotification } from '../../api/types'
import { useAction } from '../../hooks/useAction'
import { formatDateTime } from '../../lib/format'

export function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  // shortcut: polls every 30 s; switch to Server-Sent Events once the backend exposes a stream
  const q = useQuery({ queryKey: ['notifications'], queryFn: () => api.get<AppNotification[]>('/notifications'), refetchInterval: 30_000 })
  const readAll = useAction(() => api.post('/notifications/read-all'), { invalidate: [['notifications']] })
  const unread = q.data?.filter((n) => !n.read).length ?? 0

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${t('common.notifications')}${unread ? ` (${unread} unread)` : ''}`}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
      >
        <Bell className="size-5" />
        {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold">{t('common.notifications')}</p>
            {unread > 0 && <button className="text-xs font-medium text-brand-700 hover:underline" onClick={() => readAll.mutate(undefined)}>{t('common.markAllRead')}</button>}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {q.data?.length ? q.data.map((n) => (
              <li key={n.id} className={`border-b border-slate-50 px-4 py-3 text-sm ${n.read ? 'text-slate-500' : 'bg-brand-50/50 text-slate-900'}`}>
                <p>{n.text}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
              </li>
            )) : <li className="px-4 py-6 text-center text-sm text-slate-500">{t('common.noNotifications')}</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
