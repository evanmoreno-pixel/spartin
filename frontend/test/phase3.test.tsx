// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CalendarActions } from '../src/CalendarActions'
import { calendarFile, googleCalendarUrl } from '../src/calendar'
import { directionsUrl, eventPin } from '../src/locations'
import { ShareActions } from '../src/ShareActions'
import { eventShareUrl } from '../src/sharing'
import { useBrowserLocation } from '../src/useBrowserLocation'
import type { CampusEvent } from '../../shared/contracts'

const event: CampusEvent = {
  eventId: 'calendar-sample', organizerId: 'demo-organizer-1', organizerDisplayName: 'Organizer 1',
  title: 'Coffee, notes; and tea', description: 'Line one\r\nLine two\\path\n' + '😊'.repeat(40),
  location: 'Room 12; San José, CA', coordinates: null,
  startTime: '2099-03-08T23:15:00-08:00', endTime: '2099-03-09T01:45:00-07:00',
  createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z',
  capacity: 5, joinedCount: 2, waitlistedCount: 0, waitlistEnabled: false, status: 'scheduled',
}

const overrides: (() => void)[] = []

function mockNavigator(property: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(navigator, property)
  Object.defineProperty(navigator, property, { configurable: true, value })
  overrides.push(() => {
    if (original) Object.defineProperty(navigator, property, original)
    else Reflect.deleteProperty(navigator, property)
  })
}

afterEach(() => {
  cleanup()
  while (overrides.length) overrides.pop()!()
  vi.unstubAllGlobals()
})

describe('FR-04 directions and venue resolution', () => {
  it('uses explicit coordinates for campus or off-campus destinations', () => {
    const place = { location: 'San José City Hall', coordinates: { latitude: 37.3378, longitude: -121.886 } }
    expect(eventPin(place)).toEqual({ point: place.coordinates, venue: false })
    const directions = new URL(directionsUrl(place)!)
    expect(directions.hostname).toBe('www.google.com')
    expect(directions.searchParams.get('destination')).toBe('37.3378,-121.886')
    expect(directions.searchParams.get('origin')).toBeNull()
  })

  it('maps verified campus venue names and gracefully falls back for unknown or invalid coordinates', () => {
    expect(eventPin({ location: 'Student Union, Room 1200', coordinates: null })).toMatchObject({ venue: true })
    const location = '123 Example Street, San José & Main'
    const place = { location, coordinates: { latitude: NaN, longitude: -180 } }
    expect(eventPin(place)).toBeUndefined()
    expect(new URL(directionsUrl(place)!).searchParams.get('destination')).toBe(location)
    expect(eventPin({ location, coordinates: { latitude: 89, longitude: 35 } })).toBeUndefined()
    expect(directionsUrl({ location: ' ', coordinates: null })).toBeUndefined()
    expect(directionsUrl({ location: '界'.repeat(255), coordinates: null })).toBeUndefined()
  })
})

describe('FR-05 sharing', () => {
  it('uses Web Share with a stable URL and only the title and link', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    mockNavigator('share', share)
    const url = eventShareUrl(event.eventId, 'https://spartin.example/?session=private#account')
    expect(url).toBe('https://spartin.example/events/calendar-sample')
    render(<ShareActions eventId={event.eventId} title={event.title} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share event' }))
    expect(await screen.findByText('Share request completed.')).toBeVisible()
    expect(share).toHaveBeenCalledExactlyOnceWith({
      title: event.title, url: `${window.location.origin}/events/calendar-sample`,
    })
  })

  it('offers copying when Web Share is unavailable and confirms only a successful write', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    mockNavigator('share', undefined)
    mockNavigator('clipboard', { writeText })
    render(<ShareActions eventId={event.eventId} title={event.title} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share event' }))
    expect(await screen.findByText(/Direct sharing is unavailable/)).toBeVisible()
    expect(screen.getByLabelText('Event link')).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(await screen.findByText('Event link copied.')).toBeVisible()
    expect(writeText).toHaveBeenCalledExactlyOnceWith(`${window.location.origin}/events/calendar-sample`)
  })

  it('shows a selectable link when both Web Share and the clipboard are blocked', async () => {
    const blocked = vi.fn().mockRejectedValue(new DOMException('Blocked', 'NotAllowedError'))
    mockNavigator('share', blocked)
    mockNavigator('clipboard', { writeText: blocked })
    render(<ShareActions eventId={event.eventId} title={event.title} />)
    fireEvent.click(screen.getByRole('button', { name: 'Share event' }))
    expect(await screen.findByText(/share menu could not open/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(await screen.findByText(/Clipboard access is unavailable/)).toBeVisible()
    expect(screen.getByLabelText('Event link')).toHaveValue(`${window.location.origin}/events/calendar-sample`)
    expect(screen.queryByText('Event link copied.')).not.toBeInTheDocument()
  })

  it('treats dismissal of Web Share as a normal outcome', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('Dismissed', 'AbortError'))
    mockNavigator('share', share)
    render(<ShareActions eventId={event.eventId} title={event.title} />)
    const button = screen.getByRole('button', { name: 'Share event' })
    await act(async () => fireEvent.click(button))
    expect(share).toHaveBeenCalledOnce()
    expect(button).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('FR-06 browser geolocation', () => {
  function locationMock() {
    vi.stubGlobal('isSecureContext', true)
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>()
    mockNavigator('geolocation', { getCurrentPosition })
    return getCurrentPosition
  }

  const position = {
    coords: { latitude: 37.3351, longitude: -121.8812, accuracy: 37 },
  } as GeolocationPosition

  it('requests location only after activation, reports the actual radius, and clears it without sending data', () => {
    const request = locationMock()
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const { result } = renderHook(useBrowserLocation)
    expect(request).not.toHaveBeenCalled()
    act(() => result.current.locate())
    expect(result.current.pending).toBe(true)
    expect(request.mock.calls[0][2]).toEqual({ enableHighAccuracy: false, maximumAge: 0, timeout: 10_000 })
    act(() => request.mock.calls[0][0](position))
    expect(result.current.position).toEqual(position.coords)
    act(() => result.current.stop())
    expect(result.current.position).toBeUndefined()
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([
    [1, /permission was denied/],
    [2, /could not determine/],
    [3, /timed out/],
  ])('handles browser error %s without displaying a location', (code, message) => {
    const request = locationMock()
    const { result } = renderHook(useBrowserLocation)
    act(() => result.current.locate())
    act(() => request.mock.calls[0][1]?.({ code } as GeolocationPositionError))
    expect(result.current.error).toMatch(message)
    expect(result.current.pending).toBe(false)
    expect(result.current.position).toBeUndefined()
  })

  it('ignores delayed fixes after the user stops a pending location request', () => {
    const request = locationMock()
    const { result } = renderHook(useBrowserLocation)
    act(() => result.current.locate())
    act(() => result.current.stop())
    act(() => request.mock.calls[0][0](position))
    expect(result.current.pending).toBe(false)
    expect(result.current.position).toBeUndefined()
  })

  it('shows guidance for an insecure context without initiating a request', () => {
    const request = locationMock()
    vi.stubGlobal('isSecureContext', false)
    const { result } = renderHook(useBrowserLocation)
    act(() => result.current.locate())
    expect(request).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/HTTPS or localhost/)
  })
})

describe('FR-08 calendar integration', () => {
  it('encodes event details and the correct UTC instants across a timezone offset change', () => {
    const link = new URL(googleCalendarUrl(event)!)
    expect(Object.fromEntries(link.searchParams)).toEqual({
      action: 'TEMPLATE', text: event.title, details: event.description, location: event.location,
      dates: '20990309T071500Z/20990309T084500Z',
    })
  })

  it('emits RFC 5545 calendar fields, escaped text, CRLF and UTF-8 line folding', () => {
    const file = calendarFile(event, new Date('2026-11-21T21:05:06.000Z'))!
    expect(file).toMatch(/^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/)
    expect(file).toContain('BEGIN:VEVENT\r\nUID:calendar-sample@spartin.local\r\nDTSTAMP:20261121T210506Z')
    expect(file).toContain('DTSTART:20990309T071500Z\r\nDTEND:20990309T084500Z')
    expect(file).toContain('SUMMARY:Coffee\\, notes\\; and tea')
    expect(file).toContain('LOCATION:Room 12\\; San José\\, CA')
    expect(file).toMatch(/END:VEVENT\r\nEND:VCALENDAR\r\n$/)
    expect(file.replaceAll('\r\n ', '')).toContain('DESCRIPTION:Line one\\nLine two\\\\path\\n' + '😊'.repeat(40))
    for (const line of file.split('\r\n')) expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75)
  })

  it.each([
    '', 'invalid', '2099-02-29T12:00:00Z', '2099-03-09T00:00:00Z', '2099-03-09T07:15:00.999Z',
  ])('handles a missing or invalid end time (%s) without inventing a duration', endTime => {
    const invalidEvent = { ...event, endTime }
    expect(calendarFile(invalidEvent)).toBeUndefined()
    expect(googleCalendarUrl(invalidEvent)).toBeUndefined()
    render(<CalendarActions event={invalidEvent} />)
    expect(screen.getByText(/requires a valid start and end time/)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Download calendar file' })).not.toBeInTheDocument()
  })
})
