import type { CampusEvent } from '../../shared/contracts'

export const calendarViews = ['Day', 'Week', 'Month', 'Year'] as const
export type CalendarView = typeof calendarViews[number]

export const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const dayFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })
export const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
export const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' })
export const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

// Use local civil days at noon for navigation. Calculate each midnight separately for event overlap.
function civilDate(year: number, month: number, day: number) {
  const date = new Date(2000, 0, 1, 12)
  date.setFullYear(year, month, day)
  return date
}

export function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${String(date.getFullYear()).padStart(4, '0')}-${month}-${day}`
}

export function parseCalendarDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return
  const [year, month, day] = value.split('-').map(Number)
  const date = civilDate(year, month - 1, day)
  if (year > 0 && dateKey(date) === value) return date
}

export function addDays(date: Date, days: number) {
  return civilDate(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function weekStart(date: Date) {
  return addDays(date, -date.getDay())
}

export function monthStart(date: Date) {
  return civilDate(date.getFullYear(), date.getMonth(), 1)
}

export function yearMonths(date: Date) {
  return Array.from({ length: 12 }, (_, month) => civilDate(date.getFullYear(), month, 1))
}

export function shiftPeriod(date: Date, view: CalendarView, step: number) {
  if (view === 'Day' || view === 'Week') return addDays(date, step * (view === 'Week' ? 7 : 1))
  const year = date.getFullYear() + (view === 'Year' ? step : 0)
  const month = date.getMonth() + (view === 'Month' ? step : 0)
  const lastDay = civilDate(year, month + 1, 0).getDate()
  return civilDate(year, month, Math.min(date.getDate(), lastDay))
}

export function monthWeeks(date: Date) {
  const first = monthStart(date)
  const start = weekStart(first)
  const last = civilDate(first.getFullYear(), first.getMonth() + 1, 0)
  const rowCount = Math.ceil((first.getDay() + last.getDate()) / 7)
  return Array.from({ length: rowCount }, (_, row) => Array.from({ length: 7 }, (_, column) => {
    const day = addDays(start, row * 7 + column)
    return day.getMonth() === first.getMonth() ? day : null
  }))
}

export function periodRange(date: Date, view: CalendarView): [Date, Date] {
  if (view === 'Day') return [addDays(date, 0), addDays(date, 1)]
  if (view === 'Week') {
    const start = weekStart(date)
    return [start, addDays(start, 7)]
  }
  const start = view === 'Month' ? monthStart(date) : civilDate(date.getFullYear(), 0, 1)
  return [start, shiftPeriod(start, view, 1)]
}

function midnight(date: Date) {
  const start = new Date(date)
  return start.setHours(0, 0, 0, 0)
}

export function groupCalendarEvents(events: readonly CampusEvent[], [first, afterLast]: [Date, Date]) {
  const result = new Map<string, CampusEvent[]>()
  const rangeStart = midnight(first)
  const rangeEnd = midnight(afterLast)

  for (const event of events) {
    const start = Date.parse(event.startTime)
    const end = Date.parse(event.endTime)
    if (!(end > start && end > rangeStart && start < rangeEnd)) continue

    const limit = Math.min(end, rangeEnd)
    let day = addDays(new Date(Math.max(start, rangeStart)), 0)
    // Treat midnight at the event's end as exclusive so it does not add a second day.
    while (midnight(day) < limit) {
      const key = dateKey(day)
      const entries = result.get(key)
      if (entries) entries.push(event)
      else result.set(key, [event])
      day = addDays(day, 1)
    }
  }
  return result
}
