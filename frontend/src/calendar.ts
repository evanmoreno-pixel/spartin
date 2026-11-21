import type { CampusEvent } from '../../shared/contracts'
import { normalizeEventTimestamp } from '../../shared/eventTimes'

type CalendarEvent = Pick<CampusEvent, 'eventId' | 'title' | 'description' | 'location' | 'startTime' | 'endTime'>

function calendarTime(utcTimestamp: string) {
  return utcTimestamp.replace(/[-:]|\.\d{3}/g, '')
}

function eventTimes(event: CalendarEvent) {
  const start = normalizeEventTimestamp(event.startTime)
  const end = normalizeEventTimestamp(event.endTime)
  if (!start || !end) return
  const range = { start: calendarTime(start), end: calendarTime(end) }
  if (range.end > range.start) return range
}

export function googleCalendarUrl(event: CalendarEvent) {
  const times = eventTimes(event)
  if (!times) return
  const url = new URL('https://calendar.google.com/calendar/r/eventedit')
  url.search = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${times.start}/${times.end}`,
  }).toString()
  return url.href
}

function escapeText(value: string) {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replaceAll('\\', '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
}

const encoder = new TextEncoder()

function foldLine(line: string) {
  let folded = ''
  let octets = 0
  for (const character of line) {
    const width = encoder.encode(character).length
    if (octets + width > 75) {
      folded += '\r\n '
      octets = 1
    }
    folded += character
    octets += width
  }
  return folded
}

export function calendarFile(event: CalendarEvent, exportedAt = new Date()) {
  const times = eventTimes(event)
  if (!times || !Number.isFinite(exportedAt.getTime()) || exportedAt.getUTCFullYear() < 1 || exportedAt.getUTCFullYear() > 9999) return
  const stamp = calendarTime(exportedAt.toISOString())
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SpartIN//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeText(event.eventId)}@spartin.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${times.start}`,
    `DTEND:${times.end}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(foldLine).join('\r\n') + '\r\n'
}

export function downloadCalendar(event: CalendarEvent) {
  const content = calendarFile(event)
  if (!content) return false
  const file = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `spartin-${event.eventId}.ics`
  document.body.append(link)
  try {
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }
  return true
}
