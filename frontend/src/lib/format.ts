export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

const locale = () => (document.documentElement.lang === 'bn' ? 'bn-BD' : 'en-GB')

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' })

/** Whole calendar days from today to the date, in the user's own time zone (-1 yesterday, 0 today, 1 tomorrow). */
export const daysFromToday = (iso: string, now = new Date()) => {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((day(new Date(iso)) - day(now)) / 86_400_000)
}

/** "Today, 3:00 pm" / "Tomorrow, 11:00 am" near now, otherwise "4 Dec, 4:00 pm": easier to scan than a bare date. */
export const formatDateTime = (iso: string, now = new Date()) => {
  const diff = daysFromToday(iso, now)
  if (Math.abs(diff) <= 1) {
    const word = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' }).format(diff, 'day')
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}, ${formatTime(iso)}`
  }
  return new Date(iso).toLocaleString(locale(), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

export const formatTaka = (amount: number) => `৳${amount.toLocaleString(locale())}`

export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()

export const isPast = (iso: string) => new Date(iso) < new Date()

export const humanize = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replaceAll('_', ' ')

/** YYYY-MM-DD in the user's own time zone (toISOString would give the UTC date). */
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const greeting = (h = new Date().getHours()) => (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
