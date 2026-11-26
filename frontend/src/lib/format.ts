export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

const locale = () => (document.documentElement.lang === 'bn' ? 'bn-BD' : 'en-GB')

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(locale(), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' })

export const formatTaka = (amount: number) => `৳${amount.toLocaleString(locale())}`

export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()

export const humanize = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replaceAll('_', ' ')

/** YYYY-MM-DD in the user's own time zone (toISOString would give the UTC date). */
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
