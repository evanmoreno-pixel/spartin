import { CalendarDays, Clock3, MapPin, Plus, RefreshCw, UsersRound } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import type { CampusEvent } from '../../shared/contracts'
import { listEvents } from './api'
import { eventDateLabel, eventTimeLabel } from './dates'
import { participationLabel } from './Participation'
import { capacityText, EmptyState, EventStatus, LoadError, Loading, Notice } from './ui'
import { useResource } from './useResource'

export function EventCard({ event, organizer, discovery = false }: { event: CampusEvent; organizer: boolean; discovery?: boolean }) {
  const date = eventDateLabel(event.startTime)
  const href = `/${organizer ? 'organizer' : 'participant'}/events/${event.eventId}`
  const remaining = event.capacity === null ? null : Math.max(0, event.capacity - event.joinedCount)
  const capacity = !discovery || remaining === null ? capacityText(event.capacity)
    : remaining === 0 ? (event.waitlistEnabled ? 'Full · waitlist open' : 'Full')
    : `${remaining} ${remaining === 1 ? 'spot' : 'spots'} available`

  return (
    <article className="event-card">
      <div className="card-body">
        <div className="card-top">
          <div className="date-tile" aria-hidden="true"><span>{date.month}</span><strong>{date.day}</strong></div>
          {organizer
            ? <EventStatus event={event} />
            : <span className="card-host">{event.organizerDisplayName}</span>}
        </div>
        <h3><Link to={href}>{event.title}</Link></h3>
        {event.description && <p className="card-description">{event.description}</p>}
        <ul className="card-meta">
          <li><Clock3 size={16} aria-hidden="true" /><time dateTime={event.startTime}>{date.weekday}, {date.month} {date.day} · {eventTimeLabel(event.startTime)}</time></li>
          <li><MapPin size={16} aria-hidden="true" />{event.location}</li>
          <li><UsersRound size={16} aria-hidden="true" />{capacity}</li>
          {discovery && event.participation?.status && <li>{participationLabel(event.participation)}</li>}
        </ul>
      </div>
      <div className="card-footer">
        <Link className="text-link" to={href} aria-label={`View details for ${event.title}`}>View details</Link>
        {organizer && <Link className="text-link card-edit" to={`${href}/edit`} aria-label={`Edit ${event.title}`}>Edit</Link>}
      </div>
    </article>
  )
}

export function EventDashboard({ organizer }: { organizer: boolean }) {
  const [params, setParams] = useSearchParams()
  const rawPage = params.get('page') ?? '1'
  const page = /^[1-9]\d{0,6}$/.test(rawPage) ? Number(rawPage) : 1
  const load = useCallback((signal: AbortSignal) => listEvents(organizer, page, signal), [organizer, page])
  const events = useResource(load, !organizer)
  const notice = useLocation().state?.notice as string | undefined
  const createLink = <Link className="button primary" to="/organizer/events/new"><Plus size={19} aria-hidden="true" /> Create event</Link>

  function goToPage(next: number) {
    setParams(next === 1 ? {} : { page: String(next) })
  }

  return (
    <>
      {organizer && <section className="dashboard-hero">
        <div className="hero-copy">
          <p><CalendarDays size={17} aria-hidden="true" /> Organizer dashboard</p>
          <h1>Your campus events</h1>
          <div>Create meetups and manage the events you host.</div>
        </div>
        <div className="hero-action">{createLink}</div>
      </section>}
      {notice && <Notice>{notice}</Notice>}
      <section aria-labelledby="events-heading" className="events-section">
        <div className="section-heading">
          <h2 id="events-heading">{organizer ? 'My events' : 'Available events'}</h2>
          {!organizer && (
            <button type="button" className="button secondary" onClick={events.refresh} disabled={events.refreshing}>
              <RefreshCw size={16} aria-hidden="true" /> Refresh
            </button>
          )}
        </div>
        {events.pending && <Loading label="Loading events…" />}
        {!!events.error && <LoadError error={events.error} retry={events.refresh} />}
        {events.data && (
          <>
            {events.data.data.length > 0 ? (
              <div className="event-grid">
                {events.data.data.map(event => <EventCard key={event.eventId} event={event} organizer={organizer} />)}
              </div>
            ) : (
              <EmptyState title={page > 1 ? 'No events on this page' : organizer ? 'You have no events yet' : 'No available events'}>
                {page === 1 && organizer && createLink}
                {page === 1 && !organizer && <p>Check back for upcoming campus meetups.</p>}
              </EmptyState>
            )}
            {(page > 1 || events.data.pagination.hasNext) && (
              <nav className="pagination" aria-label="Event pages">
                <button type="button" className="button secondary" disabled={page === 1} onClick={() => goToPage(page - 1)}>Previous</button>
                <span>Page {page}</span>
                <button type="button" className="button secondary" disabled={!events.data.pagination.hasNext} onClick={() => goToPage(page + 1)}>Next</button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  )
}
