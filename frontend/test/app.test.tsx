// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import type { CampusEvent, User } from '../../shared/contracts'
import { App } from '../src/App'

const participant: User = { userId: 'demo-participant-1', displayName: 'Participant 1', role: 'participant' }
const organizer: User = { userId: 'demo-organizer-1', displayName: 'Organizer 1', role: 'organizer' }
const event: CampusEvent = {
  eventId: 'transfer-coffee',
  organizerId: organizer.userId,
  organizerDisplayName: organizer.displayName,
  title: 'Transfer Coffee Meetup',
  description: 'Meet other transfer students over coffee.',
  location: 'Student Union',
  startTime: '2099-04-01T17:00:00.000Z',
  endTime: '2099-04-01T18:30:00.000Z',
  capacity: 24,
  status: 'scheduled',
  createdAt: '2099-03-01T18:00:00.000Z',
  updatedAt: '2099-03-01T18:00:00.000Z',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

function open(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it('opens the participant catalog through a labeled demo selection and displays read-only event details', async () => {
  const fetch = vi.fn(async (path: string, options: RequestInit) => {
    if (path === '/api/session' && options.method === 'POST') {
      expect(JSON.parse(String(options.body))).toEqual({ accountKey: 'participant-1' })
      return json({ data: participant })
    }
    if (path === '/api/session') return json({ error: { message: 'Session required.' } }, 401)
    if (path === '/api/demo-accounts') {
      return json({ data: [{ accountKey: 'participant-1', displayName: participant.displayName, role: participant.role }] })
    }
    if (path === '/api/events?page=1') return json({ data: [event], pagination: { page: 1, hasNext: false } })
    if (path === '/api/events/transfer-coffee') return json({ data: event })
    throw new Error(`Unexpected request to ${path}`)
  })
  vi.stubGlobal('fetch', fetch)
  open()

  const user = userEvent.setup()
  expect(await screen.findByText('Simulated authentication')).toBeVisible()
  await user.click(await screen.findByRole('button', { name: /Participant 1/ }))
  expect(await screen.findByRole('heading', { name: 'Explore campus events' })).toBeVisible()
  await user.click(await screen.findByRole('link', { name: /view details for Transfer Coffee Meetup/i }))
  expect(await screen.findByRole('heading', { name: event.title })).toBeVisible()
  expect(screen.getByText(event.description)).toBeVisible()
  expect(screen.getByText(event.location)).toBeVisible()
  expect(screen.getByText(event.organizerDisplayName)).toBeVisible()
  expect(screen.getByText('24')).toBeVisible()
  expect(screen.queryByRole('button', { name: /delete|join|pass/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /edit|create/i })).not.toBeInTheDocument()
})

it('redirects a participant away from organizer form URLs', async () => {
  vi.stubGlobal('fetch', vi.fn(async (path: string) => path === '/api/session'
    ? json({ data: participant })
    : json({ data: [], pagination: { page: 1, hasNext: false } })))
  open('/organizer/events/new')
  expect(await screen.findByRole('heading', { name: 'Explore campus events' })).toBeVisible()
  expect(await screen.findByRole('heading', { name: 'No available events' })).toBeVisible()
  expect(screen.queryByLabelText('Event title')).not.toBeInTheDocument()
})

it('shows errors for missing required organizer fields and negative capacity before submitting', async () => {
  const fetch = vi.fn(async () => json({ data: organizer }))
  vi.stubGlobal('fetch', fetch)
  open('/organizer/events/new')

  const user = userEvent.setup()
  await user.type(await screen.findByLabelText(/participant capacity/i), '-1')
  await user.click(screen.getByRole('button', { name: 'Create event' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Check the highlighted fields')
  expect(screen.getByLabelText('Event title')).toHaveFocus()
  expect(screen.getByLabelText('Event title')).toHaveAccessibleDescription('Enter a title.')
  expect(screen.getByLabelText(/participant capacity/i)).toHaveAccessibleDescription(/zero or more/)
  expect(fetch).toHaveBeenCalledTimes(1)
})
