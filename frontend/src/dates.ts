const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const month = new Intl.DateTimeFormat('en-US', { month: 'short' })
const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
const clockWithZone = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })
const numeric = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

export const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export function eventDateLabel(value: string) {
  const date = new Date(value)
  return { weekday: weekday.format(date), month: month.format(date), day: date.getDate() }
}

export function eventTimeLabel(value: string) {
  return clock.format(new Date(value))
}

export function eventDateTime(value: string) {
  const date = new Date(value)
  return `${numeric.format(date).replaceAll('/', '-')} · ${clockWithZone.format(date)}`
}

export function localInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function inputToTimestamp(value: string, original?: string) {
  if (original && value === localInputValue(new Date(original))) return original
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || localInputValue(date) !== value) return
  return date.toISOString()
}
