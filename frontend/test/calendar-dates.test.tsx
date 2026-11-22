import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CampusEvent } from '../../shared/contracts'
import { addDays, dateKey, groupCalendarEvents, monthWeeks, parseCalendarDate, periodRange, shiftPeriod } from '../src/calendarDates'

function date(value: string) {
  return parseCalendarDate(value)!
}

function event(eventId: string, startTime: string, endTime: string): CampusEvent {
  return {
    eventId, startTime, endTime, title: eventId, description: '', location: 'Student Union', coordinates: null,
    capacity: null, status: 'scheduled', waitlistEnabled: false, organizerId: 'organizer', organizerDisplayName: 'Organizer',
    createdAt: startTime, updatedAt: startTime, joinedCount: 0, waitlistedCount: 0,
  }
}

it('places leap-year dates in Sunday-first rows and rejects invalid date parameters', () => {
  const weeks = monthWeeks(date('2024-02-12'))
  expect(weeks).toHaveLength(5)
  expect(weeks.every(week => week.length === 7)).toBe(true)
  expect(weeks[0].map(day => day?.getDate() ?? null)).toEqual([null, null, null, null, 1, 2, 3])
  expect(weeks[4].map(day => day?.getDate() ?? null)).toEqual([25, 26, 27, 28, 29, null, null])
  expect(monthWeeks(date('2025-02-01')).flat().filter(Boolean)).toHaveLength(28)
  expect(parseCalendarDate('2023-02-29')).toBeUndefined()
  expect(parseCalendarDate('2024-13-01')).toBeUndefined()
  expect(parseCalendarDate('2024-02-01T00:00:00Z')).toBeUndefined()
})

it('navigates December to January and clamps shorter months and non-leap years', () => {
  expect(dateKey(shiftPeriod(date('2023-12-31'), 'Day', 1))).toBe('2024-01-01')
  expect(dateKey(shiftPeriod(date('2023-12-31'), 'Month', 1))).toBe('2024-01-31')
  expect(dateKey(shiftPeriod(date('2024-01-31'), 'Month', 1))).toBe('2024-02-29')
  expect(dateKey(shiftPeriod(date('2024-02-29'), 'Year', 1))).toBe('2025-02-28')
  expect(periodRange(date('2024-01-01'), 'Week').map(dateKey)).toEqual(['2023-12-31', '2024-01-07'])
})

describe('local calendar days in Los Angeles', () => {
  const originalZone = process.env.TZ
  beforeAll(() => { process.env.TZ = 'America/Los_Angeles' })
  afterAll(() => {
    if (originalZone === undefined) delete process.env.TZ
    else process.env.TZ = originalZone
  })

  it('uses the local date for UTC timestamps and counts both days of an overnight event', () => {
    const late = event('late', '2024-06-02T05:00:00Z', '2024-06-02T06:00:00Z')
    const overnight = event('overnight', '2024-06-02T06:30:00Z', '2024-06-02T08:30:00Z')
    const toMidnight = event('to midnight', '2024-06-02T06:45:00Z', '2024-06-02T07:00:00Z')
    const grouped = groupCalendarEvents([late, overnight, toMidnight], periodRange(date('2024-06-01'), 'Month'))
    expect(grouped.get('2024-06-01')).toEqual([late, overnight, toMidnight])
    expect(grouped.get('2024-06-02')).toEqual([overnight])
    expect(grouped.get('2024-06-03')).toBeUndefined()
    expect(groupCalendarEvents([overnight], periodRange(date('2024-06-02'), 'Day')).get('2024-06-02')).toEqual([overnight])
  })

  it('handles the 23-hour spring day and 25-hour fall day without shifting adjacent dates', () => {
    expect(addDays(date('2024-03-09'), 1).getTime() - date('2024-03-09').getTime()).toBe(23 * 60 * 60_000)
    expect(addDays(date('2024-11-02'), 1).getTime() - date('2024-11-02').getTime()).toBe(25 * 60 * 60_000)
    const spring = event('spring', '2024-03-10T09:30:00Z', '2024-03-10T10:30:00Z')
    const springLate = event('spring late', '2024-03-11T06:30:00Z', '2024-03-11T07:00:00Z')
    const fall = event('fall', '2024-11-03T08:30:00Z', '2024-11-03T09:30:00Z')
    const fallLate = event('fall late', '2024-11-04T07:30:00Z', '2024-11-04T08:15:00Z')
    const march = groupCalendarEvents([spring, springLate], periodRange(date('2024-03-10'), 'Week'))
    const november = groupCalendarEvents([fall, fallLate], periodRange(date('2024-11-03'), 'Week'))
    expect(march.get('2024-03-10')).toEqual([spring, springLate])
    expect(march.get('2024-03-11')).toBeUndefined()
    expect(november.get('2024-11-03')).toEqual([fall, fallLate])
    expect(november.get('2024-11-04')).toEqual([fallLate])
  })
})
