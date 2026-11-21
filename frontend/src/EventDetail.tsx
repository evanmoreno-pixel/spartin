import { CalendarDays, Clock3, MapPin, Pencil, Trash2, UserRound, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { CampusEvent, User } from '../../shared/contracts'
import { ApiError, deleteEvent, errorMessage, getEvent } from './api'
import { eventDateTime } from './dates'
import { EmptyState, EventStatus, LoadError, Loading, Notice } from './ui'
import { useResource } from './useResource'

function DeleteDialog({ event, onClose, onDeleted }: { event: CampusEvent; onClose: () => void; onDeleted: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])

  async function confirmDelete() {
    setBusy(true)
    setError('')
    try {
      await deleteEvent(event.eventId)
      onDeleted()
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 404) {
        onDeleted()
        return
      }
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby="delete-title" onCancel={event => { event.preventDefault(); if (!busy) onClose() }}>
      <h2 id="delete-title">Delete this event?</h2>
      <p><strong>{event.title}</strong> will be permanently deleted from SpartIN.</p>
      {error && <Notice error>{error}</Notice>}
      <div className="dialog-actions">
        <button type="button" className="button secondary" autoFocus disabled={busy} onClick={onClose}>Cancel</button>
        <button type="button" className="button danger" disabled={busy} onClick={() => void confirmDelete()}>
          {busy ? 'Deleting…' : 'Delete event'}
        </button>
      </div>
    </dialog>
  )
}

export function EventDetailPage({ organizer, user }: { organizer: boolean; user: User }) {
  const { id = '' } = useParams()
  const load = useCallback((signal: AbortSignal) => getEvent(id, signal), [id])
  const resource = useResource(load, !organizer)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const notice = useLocation().state?.notice as string | undefined
  const event = resource.data
  const home = organizer ? '/organizer' : '/participant'
  const unavailable = (resource.error instanceof ApiError && resource.error.status === 404)
    || (organizer && event && event.organizerId !== user.userId)

  return (
    <div className="detail-layout">
      <Link className="back-link" to={home}>{organizer ? 'Back to My events' : 'Back to Available events'}</Link>
      {resource.pending && <Loading label="Loading event details…" />}
      {unavailable && (
        <EmptyState title="Event unavailable">
          <p>{organizer ? 'This event is unavailable in your dashboard.' : 'This event may have been postponed, ended, or deleted.'}</p>
        </EmptyState>
      )}
      {!!resource.error && !unavailable && <LoadError error={resource.error} retry={resource.refresh} />}
      {event && !unavailable && (
        <>
          {notice && <Notice>{notice}</Notice>}
          <article className="panel detail-panel">
            <header className="detail-heading">
              <div>
                <EventStatus event={event} />
                <h1>{event.title}</h1>
              </div>
              {organizer && (
                <div className="detail-actions">
                  <Link className="button secondary" to={`/organizer/events/${id}/edit`}><Pencil size={16} aria-hidden="true" /> Edit or reschedule</Link>
                  <button type="button" className="button danger-outline" onClick={() => setDeleting(true)}><Trash2 size={16} aria-hidden="true" /> Delete</button>
                </div>
              )}
            </header>
            {event.status === 'postponed' && <Notice>This event is postponed and hidden from the participant dashboard.</Notice>}
            <dl className="detail-facts">
              <div><dt><CalendarDays size={17} aria-hidden="true" /> Starts</dt><dd><time dateTime={event.startTime}>{eventDateTime(event.startTime)}</time></dd></div>
              <div><dt><Clock3 size={17} aria-hidden="true" /> Ends</dt><dd><time dateTime={event.endTime}>{eventDateTime(event.endTime)}</time></dd></div>
              <div><dt><MapPin size={17} aria-hidden="true" /> Location</dt><dd>{event.location}</dd></div>
              <div><dt><UsersRound size={17} aria-hidden="true" /> Participant capacity</dt><dd>{event.capacity ?? 'No capacity limit'}</dd></div>
              <div><dt><UserRound size={17} aria-hidden="true" /> Organizer</dt><dd>{event.organizerDisplayName}</dd></div>
            </dl>
            <section className="event-description">
              <h2>About this event</h2>
              <p>{event.description || 'No description provided.'}</p>
            </section>
          </article>
          {deleting && <DeleteDialog event={event} onClose={() => setDeleting(false)} onDeleted={() => navigate(home, { replace: true, state: { notice: 'Event deleted.' } })} />}
        </>
      )}
    </div>
  )
}
