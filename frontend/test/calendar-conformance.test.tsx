import ICAL from 'ical.js'
import { expect, it } from 'vitest'
import { calendarFile } from '../src/calendar'

it.each([
  ['2026-03-08T01:30:00-08:00', '2026-03-08T03:30:00-07:00', '2026-03-08T09:30:00Z', '2026-03-08T10:30:00Z'],
  ['2026-11-01T01:30:00-07:00', '2026-11-01T01:30:00-08:00', '2026-11-01T08:30:00Z', '2026-11-01T09:30:00Z'],
])('CAL-01 parses RFC 5545 export across a DST boundary starting %s', (startTime, endTime, startUtc, endUtc) => {
  const summary = 'Capstone; showcase, and questions'
  const description = 'Folder\\path\n' + '🗓️'.repeat(40)
  const location = 'King Library, San José'
  const text = calendarFile({ eventId: 'dst-test', title: summary, description, location, startTime, endTime },
    new Date('2026-11-21T20:00:00Z'))!
  const calendar = new ICAL.Component(ICAL.parse(text))
  expect(calendar.name).toBe('vcalendar')
  expect(calendar.getFirstPropertyValue('version')).toBe('2.0')
  const component = calendar.getFirstSubcomponent('vevent')!
  const meetup = new ICAL.Event(component)
  expect(meetup.uid).toBe('dst-test@spartin.local')
  expect(String(component.getFirstPropertyValue('dtstamp'))).toBe('2026-11-21T20:00:00Z')
  expect(String(meetup.startDate)).toBe(startUtc)
  expect(String(meetup.endDate)).toBe(endUtc)
  expect(meetup.summary).toBe(summary)
  expect(meetup.description).toBe(description)
  expect(meetup.location).toBe(location)
})
