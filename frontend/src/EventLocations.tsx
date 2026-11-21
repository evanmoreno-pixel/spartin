import { LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { CampusEvent } from '../../shared/contracts'
import { listEvents } from './api'
import { eventDateTime } from './dates'
import type { MapPin as EventPin } from './EventMap'
import { directionsUrl, eventPin } from './locations'
import { EmptyState, LoadError, Loading, Notice } from './ui'
import { useBrowserLocation } from './useBrowserLocation'
import { useResource } from './useResource'

const EventMap = lazy(() => import('./EventMap'))

function Directions({ event }: { event: CampusEvent }) {
  const url = directionsUrl(event)
  if (!url) return <p className="map-note">Directions are unavailable for this location.</p>
  return (
    <a className="button secondary" href={url} target="_blank" rel="noopener noreferrer">
      <MapPin size={16} aria-hidden="true" /> Directions
    </a>
  )
}

export function EventLocationPreview({ event }: { event: CampusEvent }) {
  const { eventId, location, coordinates } = event
  const pins = useMemo(() => {
    const pin = eventPin({ location, coordinates })
    return pin ? [{ id: eventId, title: location, point: pin.point }] : []
  }, [eventId, location, coordinates?.latitude, coordinates?.longitude])
  const pin = eventPin(event)

  return (
    <section className="event-description" aria-labelledby="event-location-heading">
      <h2 id="event-location-heading">Location and directions</h2>
      {pin ? (
        <>
          <Suspense fallback={<Loading label="Loading event map…" />}>
            <EventMap pins={pins} label="Event location map" />
          </Suspense>
          {pin.venue && <p className="map-note">The pin marks the campus venue. See the event location for room details.</p>}
        </>
      ) : <p>A map pin is unavailable for this location.</p>}
      <div className="event-tools"><Directions event={event} /></div>
    </section>
  )
}

export function ParticipantMapPage() {
  const [params, setParams] = useSearchParams()
  const rawPage = params.get('page') ?? '1'
  const page = /^[1-9]\d{0,6}$/.test(rawPage) ? Number(rawPage) : 1
  const load = useCallback((signal: AbortSignal) => listEvents(false, page, signal), [page])
  const resource = useResource(load)
  const location = useBrowserLocation()
  const [selection, select] = useState<string[]>([])
  const events = resource.data?.data
  const pins = useMemo(() => {
    return (events ?? []).flatMap((event): EventPin[] => {
      const pin = eventPin(event)
      return pin ? [{ id: event.eventId, title: event.title, point: pin.point }] : []
    })
  }, [events])
  const selected = events?.filter(event => selection.includes(event.eventId))

  function changePage(next: number) {
    select([])
    setParams(next === 1 ? {} : { page: String(next) })
  }

  return (
    <section className="events-section" aria-labelledby="events-map-heading">
      <div className="section-heading">
        <h2 id="events-map-heading">Event map</h2>
        <button type="button" className="button secondary" disabled={resource.refreshing} onClick={resource.refresh}>
          <RefreshCw size={16} aria-hidden="true" /> Refresh
        </button>
      </div>
      <div className="panel map-panel">
        <div className="map-toolbar">
          {location.pending || location.position ? (
            <button type="button" className="button secondary" onClick={location.stop}>Stop using my location</button>
          ) : (
            <button type="button" className="button secondary" onClick={location.locate}>
              <LocateFixed size={17} aria-hidden="true" /> Use my location
            </button>
          )}
          {location.pending && <span role="status">Finding your location…</span>}
          {location.position && <span role="status">Approximate location · reported accuracy <strong>{Math.ceil(location.position.accuracy)} m</strong></span>}
        </div>
        {location.error && <Notice error>{location.error}</Notice>}
        {resource.pending ? <Loading label="Loading event locations…" /> : (
          <Suspense fallback={<Loading label="Loading event map…" />}>
            <EventMap pins={pins} label="Available event locations" onSelect={select} position={location.position} />
          </Suspense>
        )}
        {!!selected?.length && (
          <section className="map-selection" aria-label="Selected events">
            {selected.map(event => (
              <div className="map-selected-event" key={event.eventId}>
                <h3>{event.title}</h3>
                <p><time dateTime={event.startTime}>{eventDateTime(event.startTime)}</time> · {event.location}</p>
                <div className="event-tools">
                  <Link className="button primary" to={`/participant/events/${event.eventId}`}>View event details</Link>
                  <Directions event={event} />
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
      {!!resource.error && <LoadError error={resource.error} retry={resource.refresh} />}
      {events?.length === 0 && <EmptyState title="No available events"><Link className="text-link" to="/participant/browse">Browse events</Link></EmptyState>}
      {!!events?.length && (
        <section className="events-section" aria-labelledby="map-locations-heading">
          <h3 id="map-locations-heading">Event locations</h3>
          <ul className="participation-list map-location-list">
            {events.map(event => (
              <li className="panel participation-row" key={event.eventId}>
                <div>
                  <h3><Link className="text-link" to={`/participant/events/${event.eventId}`}>{event.title}</Link></h3>
                  <p>{event.location}</p>
                  {!eventPin(event) && <p>No map pin</p>}
                </div>
                <Directions event={event} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {resource.data && (page > 1 || resource.data.pagination.hasNext) && (
        <nav className="pagination" aria-label="Map event pages">
          <button type="button" className="button secondary" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button>
          <span>Page {page}</span>
          <button type="button" className="button secondary" disabled={!resource.data.pagination.hasNext} onClick={() => changePage(page + 1)}>Next</button>
        </nav>
      )}
    </section>
  )
}
