import type { EventFields } from '../../../shared/contracts.js'
import { HttpError, objectBody } from '../api/httpError.js'

const editableFields = new Set(['title', 'description', 'startTime', 'endTime', 'location', 'capacity', 'status'])
const dateTimePattern = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

function normalizeTime(value: unknown) {
  if (typeof value !== 'string' || !dateTimePattern.test(value) || value !== value.trim()) return
  const day = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10)) return
  const instant = new Date(value)
  if (!Number.isFinite(instant.getTime()) || instant.getUTCFullYear() < 1 || instant.getUTCFullYear() > 9999) return
  return instant.toISOString()
}

export function validateEvent(body: unknown, current?: EventFields): EventFields {
  const input = objectBody(body)
  const keys = Object.keys(input)
  if (keys.some(key => !editableFields.has(key)) || (current && keys.length === 0)) {
    throw new HttpError(400, 'INVALID_EVENT', 'Send at least one editable event field and only editable fields.')
  }

  const values = { description: '', capacity: null, status: 'scheduled', ...current, ...input }
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
  const startTime = normalizeTime(values.startTime)
  const endTime = normalizeTime(values.endTime)
  if (!startTime) errors.startTime = 'Enter a valid start date and time with a timezone.'
  if (!endTime) errors.endTime = 'Enter a valid end date and time with a timezone.'
  if (startTime && endTime && endTime <= startTime) errors.endTime = 'End time must be after start time.'

  const { capacity, status } = values
  const validCapacity = capacity === null || (typeof capacity === 'number' && Number.isSafeInteger(capacity) && capacity >= 0)
  const validStatus = status === 'scheduled' || status === 'postponed'
  if (!validCapacity) errors.capacity = 'Enter a whole number of zero or more, or leave capacity blank.'
  if (!validStatus) errors.status = 'Choose Scheduled or Postponed.'

  if (Object.keys(errors).length || !startTime || !endTime || !validCapacity || !validStatus) {
    throw new HttpError(400, 'INVALID_EVENT', 'Check the event details and try again.', errors)
  }
  return { title, description, location, startTime, endTime, capacity, status }
}
