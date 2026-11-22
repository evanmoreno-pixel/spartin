// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import type { CampusEvent, User } from '../../shared/contracts'
import { App } from '../src/App'

const participant: User = { userId: 'demo-participant-1', displayName: 'Participant 1', role: 'participant' }
const organizer: User = { userId: 'demo-organizer-1', displayName: 'Organizer 1', role: 'organizer' }
const selectedDay = 'Saturday, February 3, 2024'
const event: CampusEvent = {
  eventId: 'study-circle', title: 'Study Circle', description: 'Bring your notes.', location: 'King Library', coordinates: null,
  startTime: new Date(2024, 1, 3, 14).toISOString(), endTime: new Date(2024, 1, 3, 15).toISOString(),
  organizerId: organizer.userId, organizerDisplayName: organizer.displayName, capacity: 24, status: 'scheduled',
  waitlistEnabled: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', joinedCount: 0, waitlistedCount: 0,
  participation: { status: null, waitlistPosition: null },
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const page = (data: CampusEvent[] = [], number = 1, hasNext = false) => json({ data, pagination: { page: number, hasNext } })

function open(path = '/participant/calendar?date=2024-02-01') {
  render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('renders calendar dates, combines event pages, handles overflow and opens the existing details', async () => {
  const fetch = vi.fn(async (path: string) => {
    if (path === '/api/session') return json({ data: participant })
    if (path === '/api/events?page=1') return page([event, { ...event, eventId: 'tour', title: 'Campus Tour' }], 1, true)
    if (path === '/api/events?page=2') return page([{ ...event, eventId: 'workshop', title: 'Design Workshop' }], 2)
    if (path === `/api/events/${event.eventId}`) return json({ data: event })
    throw new Error(`Unexpected request ${path}`)
  })
  vi.stubGlobal('fetch', fetch)
  open()
  const user = userEvent.setup()
  expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page')
  const table = await screen.findByRole('table', { name: 'February 2024' })
  expect(within(table).getAllByRole('columnheader').map(header => header.textContent)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  expect(within(table).getAllByRole('button')).toHaveLength(29)
  const row = within(table).getAllByRole('row')[1]
  expect(within(within(row).getAllByRole('cell')[4]).getByRole('button', { name: 'Thursday, February 1, 2024, 0 events' })).toBeVisible()
  expect(screen.getByText('No events scheduled.')).toBeVisible()

  const day = within(table).getByRole('button', { name: `${selectedDay}, 3 events` })
  const cell = day.closest('td')!
  expect(within(cell).getByRole('link', { name: 'Study Circle' })).toBeVisible()
  expect(within(cell).getByText('+1 more')).toBeVisible()
  expect(within(cell).queryByRole('link', { name: 'Design Workshop' })).not.toBeInTheDocument()
  day.focus()
  await user.keyboard('{Enter}')
  expect(day).toHaveAttribute('aria-pressed', 'true')
  const agenda = screen.getByRole('region', { name: selectedDay })
  expect(within(agenda).getAllByRole('link')).toHaveLength(3)
  expect(within(agenda).getAllByText('2:00 PM')).toHaveLength(3)
  expect(within(agenda).getAllByText('3:00 PM')).toHaveLength(3)
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/session', '/api/events?page=1', '/api/events?page=2'])

  await user.click(within(agenda).getByRole('link', { name: event.title }))
  expect(await screen.findByRole('heading', { name: event.title })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Join' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'Pass' })).toBeVisible()
  await user.click(screen.getByRole('link', { name: 'Back to Calendar' }))
  expect(await screen.findByRole('region', { name: selectedDay })).toBeVisible()
})

it('navigates in all four views, drills down from the year, and returns to the current date', async () => {
  vi.setSystemTime(new Date(2024, 1, 3, 12))
  const fetch = vi.fn(async (path: string) => path === '/api/session' ? json({ data: participant }) : page([event]))
  vi.stubGlobal('fetch', fetch)
  open('/participant/calendar')
  const user = userEvent.setup()
  const click = (name: string) => user.click(screen.getByRole('button', { name, exact: true }))
  const period = () => screen.getByRole('heading', { level: 3 }).textContent
  await screen.findByRole('table', { name: 'February 2024' })
  expect(screen.getByRole('button', { name: `${selectedDay}, 1 event` })).toHaveAttribute('aria-current', 'date')
  expect(screen.getByRole('button', { name: 'Month', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await click('Previous month')
  expect(period()).toBe('January 2024')
  await click('Next month')
  expect(period()).toBe('February 2024')
  await click('Week')
  expect(period()).toMatch(/Jan.*28.*Feb.*3.*2024/)
  expect(screen.getAllByRole('button', { name: /^Open / })).toHaveLength(7)
  await click('Next week')
  expect(period()).toMatch(/Feb.*4.*10.*2024/)
  await click('Previous week')
  expect(screen.getByRole('link', { name: event.title })).toBeVisible()
  await click(`Open ${selectedDay}`)
  expect(period()).toBe(selectedDay)
  expect(screen.getByRole('button', { name: 'Day', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await click('Next day')
  expect(period()).toBe('Sunday, February 4, 2024')
  await click('Previous day')
  expect(period()).toBe(selectedDay)
  await click('Year')
  expect(screen.getAllByRole('table')).toHaveLength(12)
  expect(within(screen.getByRole('table', { name: 'February' })).getByRole('cell', { name: `${selectedDay}, 1 event` })).toBeVisible()
  await click('Next year')
  expect(period()).toBe('2025')
  await click('Previous year')
  expect(period()).toBe('2024')
  await click('December')
  expect(period()).toBe('December 2024')
  await click('Next month')
  expect(period()).toBe('January 2025')
  await click('Today')
  expect(period()).toBe('February 2024')
  expect(screen.getByRole('button', { name: `${selectedDay}, 1 event` })).toHaveAttribute('aria-pressed', 'true')
  expect(fetch).toHaveBeenCalledTimes(2)
})

it('provides a loading state and a retry after an event catalog error', async () => {
  const initial = Promise.withResolvers<Response>()
  const fetch = vi.fn(async (path: string) => {
    if (path === '/api/session') return json({ data: participant })
    if (fetch.mock.calls.length === 2) return initial.promise
    return page([])
  })
  vi.stubGlobal('fetch', fetch)
  open()
  expect(await screen.findByText('Loading calendar events…')).toBeVisible()
  initial.resolve(json({ error: { message: 'Event catalog unavailable.' } }, 500))
  expect(await screen.findByRole('alert')).toHaveTextContent('Event catalog unavailable.')
  await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByText('No events scheduled.')).toBeVisible()
})

it('keeps the calendar route within the participant dashboard', async () => {
  const fetch = vi.fn(async (path: string) => path === '/api/session' ? json({ data: organizer }) : page())
  vi.stubGlobal('fetch', fetch)
  open()
  expect(await screen.findByRole('heading', { name: 'Your campus events' })).toBeVisible()
  expect(screen.queryByRole('link', { name: 'Calendar' })).not.toBeInTheDocument()
  expect(fetch.mock.calls.map(([path]) => path)).toEqual(['/api/session', '/api/organizer/events?page=1'])
})
