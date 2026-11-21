import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listParticipation } from './api'
import { eventDateTime } from './dates'
import { participationLabel, useParticipationAction } from './Participation'
import { EmptyState, EventStatus, LoadError, Loading, Notice } from './ui'
import { useResource } from './useResource'

export function MyEvents() {
  const [params, setParams] = useSearchParams()
  const rawPage = params.get('page') ?? '1'
  const page = /^[1-9]\d{0,6}$/.test(rawPage) ? Number(rawPage) : 1
  const load = useCallback((signal: AbortSignal) => listParticipation(page, signal), [page])
  const events = useResource(load, true)
  const action = useParticipationAction(events.refresh)

  return (
    <section className="events-section" aria-labelledby="my-events-heading">
      <div className="section-heading"><h2 id="my-events-heading">My events</h2></div>
      {action.notice && <Notice>{action.notice}</Notice>}
      {action.error && <Notice error>{action.error}</Notice>}
      {events.pending && <Loading label="Loading your events…" />}
      {!!events.error && <LoadError error={events.error} retry={events.refresh} />}
      {events.data && (
        <>
          {events.data.data.length === 0 ? (
            <EmptyState title={page === 1 ? 'No joined or waitlisted events' : 'No events on this page'}>
              <Link className="text-link" to="/participant">Discover campus events</Link>
            </EmptyState>
          ) : (
            <ul className="participation-list">
              {events.data.data.map(event => {
                const state = event.participation!
                const open = event.status === 'scheduled' && Date.parse(event.endTime) > Date.now()
                const href = `/participant/events/${event.eventId}`
                return (
                  <li className="panel participation-row" key={event.eventId}>
                    <div>
                      <p className="participation-state">{participationLabel(state)} {!open && <EventStatus event={event} />}</p>
                      <h3>{open ? <Link className="text-link" to={href}>{event.title}</Link> : event.title}</h3>
                      <p><time dateTime={event.startTime}>{eventDateTime(event.startTime)}</time> · {event.location}</p>
                    </div>
                    <button type="button" className="button secondary" disabled={action.busy || events.refreshing}
                      aria-label={`Leave event: ${event.title}`}
                      onClick={() => void action.submit(event.eventId, 'leave')}>Leave event</button>
                  </li>
                )
              })}
            </ul>
          )}
          {(page > 1 || events.data.pagination.hasNext) && (
            <nav className="pagination" aria-label="My event pages">
              <button type="button" className="button secondary" disabled={page === 1 || action.busy}
                onClick={() => setParams(page === 2 ? {} : { page: String(page - 1) })}>Previous</button>
              <span>Page {page}</span>
              <button type="button" className="button secondary" disabled={!events.data.pagination.hasNext || action.busy}
                onClick={() => setParams({ page: String(page + 1) })}>Next</button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
