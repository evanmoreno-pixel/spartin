import { CalendarDays, MapPin } from 'lucide-react'
import { useCallback, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { CampusEvent, EventStatus, User } from '../../shared/contracts'
import { ApiError, errorMessage, getEvent, saveEvent } from './api'
import { inputToTimestamp, localInputValue, localZone } from './dates'
import { EmptyState, LoadError, Loading, Notice } from './ui'
import { useResource } from './useResource'

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <span className="field-error" id={`${name}-error`}>{error}</span>}
    </div>
  )
}

function EventForm({ event }: { event?: CampusEvent }) {
  const back = event ? `/organizer/events/${event.eventId}` : '/organizer'
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [summary, setSummary] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<EventStatus>(event?.status ?? 'scheduled')

  function fieldProps(name: string, hint?: string) {
    return {
      id: name,
      name,
      'aria-invalid': !!errors[name],
      'aria-describedby': [hint, errors[name] && `${name}-error`].filter(Boolean).join(' ') || undefined,
    }
  }

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    const form = formEvent.currentTarget
    const values = new FormData(form)
    const title = String(values.get('title')).trim()
    const description = String(values.get('description')).trim()
    const location = String(values.get('location')).trim()
    const startTime = inputToTimestamp(String(values.get('startTime')), event?.startTime)
    const endTime = inputToTimestamp(String(values.get('endTime')), event?.endTime)
    const capacityText = String(values.get('capacity')).trim()
    const capacity = capacityText ? Number(capacityText) : null
    const fields: Record<string, string> = {}

    if (!title) fields.title = 'Enter a title.'
    if (!location) fields.location = 'Enter a location.'
    if (!startTime) fields.startTime = 'Enter a valid local start date and time.'
    if (!endTime) fields.endTime = 'Enter a valid local end date and time.'
    if (startTime && endTime && endTime <= startTime) fields.endTime = 'End time must be after start time.'
    if (capacity !== null && (!/^\d+$/.test(capacityText) || !Number.isSafeInteger(capacity))) {
      fields.capacity = 'Enter a whole number of zero or more, or leave capacity blank.'
    }

    if (Object.keys(fields).length || !startTime || !endTime) {
      setErrors(fields)
      setSummary('Check the highlighted fields and try again.')
      form.querySelector<HTMLElement>(`[name="${Object.keys(fields)[0]}"]`)?.focus()
      return
    }

    setBusy(true)
    setErrors({})
    setSummary('')
    try {
      const fields = { title, description, location, startTime, endTime, capacity, status }
      const changes = event
        ? Object.fromEntries(Object.entries(fields).filter(([key, value]) => event[key as keyof typeof fields] !== value))
        : fields
      if (event && Object.keys(changes).length === 0) {
        navigate(back, { replace: true })
        return
      }
      const saved = await saveEvent(changes, event?.eventId)
      const notice = !event ? 'Event created.'
        : saved.status === 'postponed' && event.status !== 'postponed' ? 'Event postponed.'
        : saved.startTime !== event.startTime || saved.endTime !== event.endTime ? 'Event rescheduled.' : 'Event updated.'
      navigate(`/organizer/events/${saved.eventId}`, { replace: true, state: { notice } })
    } catch (failure) {
      if (failure instanceof ApiError) setErrors(failure.fields ?? {})
      setSummary(errorMessage(failure))
      setBusy(false)
    }
  }

  return (
    <>
      <Link className="back-link" to={back}>{event ? 'Back to event details' : 'Back to My events'}</Link>
      <div className="editor-heading">
        <h1>{event ? 'Edit event' : 'Create event'}</h1>
        <p>{event ? 'Update the details, reschedule, or postpone this meetup.' : 'Add the details for a new campus meetup.'}</p>
      </div>
      <form className="panel editor-panel" onSubmit={formEvent => void submit(formEvent)} noValidate aria-busy={busy}>
        {summary && <Notice error>{summary}</Notice>}
        <fieldset disabled={busy}>
          <legend><MapPin size={19} aria-hidden="true" /> Event information</legend>
          <Field name="title" label="Event title" error={errors.title}>
            <input {...fieldProps('title')} required maxLength={150} defaultValue={event?.title} />
          </Field>
          <Field name="description" label="Description (optional)" error={errors.description}>
            <textarea {...fieldProps('description')} rows={4} maxLength={5000} defaultValue={event?.description} />
          </Field>
          <div className="form-grid">
            <Field name="location" label="Location" error={errors.location}>
              <input {...fieldProps('location')} required maxLength={255} defaultValue={event?.location} />
            </Field>
            <Field name="capacity" label="Participant capacity (optional)" error={errors.capacity}>
              <input {...fieldProps('capacity', 'capacity-hint')} inputMode="numeric" defaultValue={event?.capacity ?? ''} />
              <small id="capacity-hint">Leave blank for no limit.</small>
            </Field>
          </div>
        </fieldset>
        <fieldset disabled={busy}>
          <legend><CalendarDays size={19} aria-hidden="true" /> Schedule</legend>
          <p className="form-hint" id="time-hint">Times use your local timezone ({localZone}).</p>
          <div className="form-grid">
            <Field name="startTime" label="Start date and time" error={errors.startTime}>
              <input {...fieldProps('startTime', 'time-hint')} type="datetime-local" required defaultValue={event && localInputValue(new Date(event.startTime))} />
            </Field>
            <Field name="endTime" label="End date and time" error={errors.endTime}>
              <input {...fieldProps('endTime', 'time-hint')} type="datetime-local" required defaultValue={event && localInputValue(new Date(event.endTime))} />
            </Field>
          </div>
          {event && (
            <Field name="status" label="Status" error={errors.status}>
              <select {...fieldProps('status', 'status-hint')} value={status} onChange={change => setStatus(change.target.value as EventStatus)}>
                <option value="scheduled">Scheduled</option>
                <option value="postponed">Postponed</option>
              </select>
              <small id="status-hint">Postponed events stay in your dashboard and are hidden from participants.</small>
            </Field>
          )}
        </fieldset>
        <div className="editor-actions">
          <Link className="button secondary" to={back}>Cancel</Link>
          <button type="submit" className="button primary" disabled={busy}>{busy ? 'Saving…' : event ? 'Save changes' : 'Create event'}</button>
        </div>
      </form>
    </>
  )
}

function ExistingEventEditor({ id, user }: { id: string; user: User }) {
  const load = useCallback((signal: AbortSignal) => getEvent(id, signal), [id])
  const resource = useResource(load)
  if (resource.pending) return <Loading label="Loading event…" />
  if ((resource.error instanceof ApiError && resource.error.status === 404)
    || (resource.data && resource.data.organizerId !== user.userId)) {
    return (
      <EmptyState title="Event unavailable">
        <Link className="button secondary" to="/organizer">Return to my events</Link>
      </EmptyState>
    )
  }
  if (resource.error) return <LoadError error={resource.error} retry={resource.refresh} />
  return <EventForm event={resource.data} />
}

export function EventEditor({ user }: { user: User }) {
  const { id } = useParams()
  return <div className="editor-layout">{id ? <ExistingEventEditor key={id} id={id} user={user} /> : <EventForm />}</div>
}
