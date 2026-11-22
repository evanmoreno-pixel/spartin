import { CalendarDays, RefreshCw } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { CampusEvent } from '../../shared/contracts'
import { listDiscovery, type EventPage } from './api'
import { EventCard } from './EventDashboard'
import { JoinPassButtons, useParticipationAction } from './Participation'
import { EmptyState, LoadError, Loading, Notice } from './ui'
import { useResource } from './useResource'

export function ParticipantLayout() {
  return (
    <>
      <section className="dashboard-hero">
        <div className="hero-copy">
          <p><CalendarDays size={17} aria-hidden="true" /> Participant dashboard</p>
          <h1>Explore campus events</h1>
          <div>Find upcoming meetups at San José State University.</div>
        </div>
      </section>
      <nav className="event-nav" aria-label="Participant dashboard">
        <NavLink end to="/participant">Discover</NavLink>
        <NavLink to="/participant/browse">Browse all</NavLink>
        <NavLink to="/participant/calendar">Calendar</NavLink>
        <NavLink to="/participant/map">Map</NavLink>
        <NavLink to="/participant/my-events">My events</NavLink>
      </nav>
      <Outlet />
    </>
  )
}

const swipeThreshold = 64

export function ParticipantDiscovery() {
  const events = useResource(listDiscovery, true)
  const [held, setHeld] = useState<CampusEvent>()
  const [completed, setCompleted] = useState<{ page?: EventPage; id: string }>()
  const deck = useRef<HTMLElement>(null)
  const gesture = useRef<{ id: number; x: number; y: number; eventId: string; dragging: boolean }>(null)
  const suppressClick = useRef(false)
  const [offset, setOffset] = useState(0)
  const navigate = useNavigate()
  const action = useParticipationAction(eventId => {
    setHeld(undefined)
    setCompleted({ page: events.data, id: eventId })
    if (document.activeElement === document.body || deck.current?.contains(document.activeElement)) deck.current?.focus()
    events.refresh()
  })
  const data = events.data?.data
  const event = held
    ? data?.find(candidate => candidate.eventId === held.eventId) ?? held
    : data?.find(candidate => completed?.page !== events.data || candidate.eventId !== completed?.id)
  const busy = action.busy || events.refreshing

  function submit(choice: 'join' | 'pass') {
    if (!event || busy) return
    setHeld(event)
    void action.submit(event.eventId, choice)
  }

  function start(pointer: PointerEvent<HTMLElement>) {
    if (pointer.button !== 0 || !pointer.isPrimary || busy || !event) return
    suppressClick.current = false
    gesture.current = { id: pointer.pointerId, x: pointer.clientX, y: pointer.clientY, eventId: event.eventId, dragging: false }
  }

  function move(pointer: PointerEvent<HTMLElement>) {
    const current = gesture.current
    if (!current || current.id !== pointer.pointerId) return
    const dx = pointer.clientX - current.x
    const dy = pointer.clientY - current.y
    if (!current.dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        reset()
        return
      }
      if (Math.abs(dx) <= 10 || Math.abs(dx) <= Math.abs(dy)) return
      current.dragging = true
      suppressClick.current = true
      pointer.currentTarget.setPointerCapture(pointer.pointerId)
    }
    setOffset(Math.max(-140, Math.min(140, dx)))
  }

  function reset() {
    gesture.current = null
    setOffset(0)
  }

  function end(pointer: PointerEvent<HTMLElement>) {
    const current = gesture.current
    if (!current || current.id !== pointer.pointerId) return
    const dx = pointer.clientX - current.x
    const dy = pointer.clientY - current.y
    reset()
    if (event && Math.abs(dx) >= swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
      suppressClick.current = true
      if (event.eventId === current.eventId) submit(dx > 0 ? 'join' : 'pass')
    }
  }

  return (
    <section className="events-section" aria-labelledby="discover-heading">
      <div className="section-heading">
        <h2 id="discover-heading">Discover events</h2>
        <button type="button" className="button secondary" onClick={() => { setHeld(undefined); events.refresh() }}
          disabled={busy}><RefreshCw size={16} aria-hidden="true" /> Refresh</button>
      </div>
      <div className="swipe-deck">
        {action.error && <Notice error>{action.error}</Notice>}
        {action.notice && <Notice>{action.notice}</Notice>}
        {events.pending && <Loading label="Loading events…" />}
        {!!events.error && <LoadError error={events.error} retry={events.refresh} />}
        {!event && events.data && (events.refreshing
          ? <Loading label="Finding the next event…" />
          : <EmptyState title="No available events"><Link className="text-link" to="/participant/browse">Browse all events</Link></EmptyState>)}
        <section ref={deck} tabIndex={event ? 0 : -1} aria-label="Event deck" aria-describedby={event ? 'swipe-hint' : undefined}
          onKeyDown={key => {
            if (!event || key.altKey || key.ctrlKey || key.metaKey || !['ArrowLeft', 'ArrowRight'].includes(key.key)) return
            key.preventDefault()
            if (!key.repeat) submit(key.key === 'ArrowRight' ? 'join' : 'pass')
          }}>
          {event && (
            <>
              <p className="swipe-hint" id="swipe-hint">Swipe or use the arrow keys on the deck. Left to pass, right to join.</p>
              <div className="swipe-surface" onPointerDown={start} onPointerMove={move} onPointerUp={end}
                onPointerCancel={reset} onDragStart={event => event.preventDefault()}
                onLostPointerCapture={pointer => {
                  // A touch can transfer implicit capture from a card child to this surface.
                  if (pointer.target === pointer.currentTarget) reset()
                }}
                onClickCapture={click => {
                  if (suppressClick.current && click.detail !== 0) {
                    click.preventDefault()
                    click.stopPropagation()
                  }
                }}
                onClick={click => {
                  if (!(click.target as Element).closest('a')) navigate(`/participant/events/${event.eventId}`)
                }}>
                <div className="swipe-card" style={{ transform: offset ? `translateX(${offset}px)` : undefined }}>
                  <EventCard event={event} organizer={false} discovery />
                </div>
              </div>
              <div className="participation-actions">
                <JoinPassButtons event={event} busy={busy} onAction={submit} />
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  )
}
