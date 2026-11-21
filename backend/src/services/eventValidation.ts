import type { EventFields } from '../../../shared/contracts.js'
import { validCoordinates } from '../../../shared/coordinates.js'
import { normalizeEventTimestamp } from '../../../shared/eventTimes.js'
import { HttpError, objectBody } from '../api/httpError.js'

const editableFields = new Set(['title', 'description', 'startTime', 'endTime', 'location', 'coordinates', 'capacity', 'status', 'waitlistEnabled'])

export function validateEvent(body: unknown, current?: EventFields): EventFields {
  const input = objectBody(body)
  const keys = Object.keys(input)
  if (keys.some(key => !editableFields.has(key)) || (current && keys.length === 0)) {
    throw new HttpError(400, 'INVALID_EVENT', 'Send at least one editable event field and only editable fields.')
  }

  const values = { description: '', capacity: null, status: 'scheduled', waitlistEnabled: false, ...current, ...input }
  const errors: Record<string, string> = {}
  function readText(field: 'title' | 'description' | 'location', label: string, limit: number, required = true) {
    const value = values[field]
    if (typeof value !== 'string' || (required && !value.trim())) {
      errors[field] = required ? `Enter a ${label}.` : `Enter a text ${label}.`
      return ''
    }
    if (value.includes('\0') || value.trim().length > limit) {
      errors[field] = `Enter a valid ${label} of ${limit} characters or fewer.`
    }
    return value.trim()
  }

  const title = readText('title', 'title', 150)
  const description = readText('description', 'description', 5000, false)
  const location = readText('location', 'location', 255)
  // Keep an existing pin only if it still refers to the same location.
  const coordinates = Object.hasOwn(input, 'coordinates') ? input.coordinates
    : current && location === current.location ? current.coordinates : null
  const validPin = coordinates === null || (validCoordinates(coordinates) && Object.keys(coordinates).length === 2)
  if (!validPin) errors.coordinates = 'Enter both latitude (−90 to 90) and longitude (−180 to 180), or clear the pin.'
  const startTime = normalizeEventTimestamp(values.startTime)
  const endTime = normalizeEventTimestamp(values.endTime)
  if (!startTime) errors.startTime = 'Enter a valid start date and time with a timezone.'
  if (!endTime) errors.endTime = 'Enter a valid end date and time with a timezone.'
  if (startTime && endTime && endTime <= startTime) errors.endTime = 'End time must be after start time.'

  const { capacity, status, waitlistEnabled } = values
  const validCapacity = capacity === null || (typeof capacity === 'number' && Number.isSafeInteger(capacity) && capacity >= 0)
  const validStatus = status === 'scheduled' || status === 'postponed'
  if (!validCapacity) errors.capacity = 'Enter a whole number of zero or more, or leave capacity blank.'
  if (!validStatus) errors.status = 'Choose Scheduled or Postponed.'
  if (typeof waitlistEnabled !== 'boolean') errors.waitlistEnabled = 'Choose whether waitlisting is enabled.'

  if (Object.keys(errors).length || !startTime || !endTime || !validCapacity || !validStatus || !validPin || typeof waitlistEnabled !== 'boolean') {
    throw new HttpError(400, 'INVALID_EVENT', 'Check the event details and try again.', errors)
  }
  return { title, description, location, coordinates, startTime, endTime, capacity, status, waitlistEnabled }
}

export function isEventAvailable(event: Pick<EventFields, 'status' | 'endTime'>, now: string) {
  return event.status === 'scheduled' && event.endTime > now
}
