import type { DatabaseSync } from 'node:sqlite'
import type { CampusEvent, EventFields } from '../../../shared/contracts.js'
import { transaction } from './database.js'

export const eventPageSize = 24

const eventQuery = `
  SELECT e.event_id AS eventId, e.organizer_id AS organizerId, u.display_name AS organizerDisplayName,
    e.title, e.description, e.start_time AS startTime, e.end_time AS endTime,
    e.location, e.latitude, e.longitude, e.capacity, e.status, e.created_at AS createdAt, e.updated_at AS updatedAt,
    e.waitlist_enabled AS waitlistEnabled,
    (SELECT count(*) FROM participation p WHERE p.event_id = e.event_id AND p.status = 'joined') AS joinedCount,
    (SELECT count(*) FROM participation p WHERE p.event_id = e.event_id AND p.status = 'waitlisted') AS waitlistedCount
  FROM events e JOIN users u ON e.organizer_id = u.user_id
`

type EventRow = Omit<CampusEvent, 'waitlistEnabled' | 'coordinates'> & {
  waitlistEnabled: number
  latitude: number | null
  longitude: number | null
}

function toCampusEvent(row: EventRow): CampusEvent {
  const { latitude, longitude, waitlistEnabled, ...fields } = row
  const coordinates = latitude === null || longitude === null ? null : { latitude, longitude }
  return { ...fields, coordinates, waitlistEnabled: waitlistEnabled === 1 }
}

export class EventRepository {
  constructor(private readonly db: DatabaseSync) {}

  listAvailable(now: string, limit: number, offset: number, discoveryUserId?: string) {
    const filter = discoveryUserId ? `AND NOT EXISTS (
      SELECT 1 FROM participation p WHERE p.event_id = e.event_id AND p.user_id = ? AND p.status <> 'left'
    )` : ''
    const filterParams = discoveryUserId ? [discoveryUserId] : []
    const rows = this.db.prepare(`${eventQuery} WHERE e.status = 'scheduled' AND e.end_time > ? ${filter}
      ORDER BY e.start_time, e.event_id LIMIT ? OFFSET ?`)
      .all(now, ...filterParams, limit, offset) as unknown as EventRow[]
    return rows.map(toCampusEvent)
  }

  listOwned(organizerId: string, limit: number, offset: number) {
    const rows = this.db.prepare(`${eventQuery} WHERE e.organizer_id = ?
      ORDER BY e.start_time, e.event_id LIMIT ? OFFSET ?`)
      .all(organizerId, limit, offset) as unknown as EventRow[]
    return rows.map(toCampusEvent)
  }

  listParticipating(userId: string, limit: number, offset: number) {
    const rows = this.db.prepare(`${eventQuery}
      JOIN participation p ON p.event_id = e.event_id
      WHERE p.user_id = ? AND p.status IN ('joined', 'waitlisted')
      ORDER BY e.start_time, e.event_id LIMIT ? OFFSET ?`)
      .all(userId, limit, offset) as unknown as EventRow[]
    return rows.map(toCampusEvent)
  }

  find(eventId: string) {
    const row = this.db.prepare(`${eventQuery} WHERE e.event_id = ?`).get(eventId) as EventRow | undefined
    return row && toCampusEvent(row)
  }

  create(eventId: string, organizerId: string, fields: EventFields, timestamp: string) {
    this.db.prepare(`
      INSERT INTO events (event_id, organizer_id, title, description, start_time, end_time,
        location, latitude, longitude, capacity, status, waitlist_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, organizerId, fields.title, fields.description, fields.startTime, fields.endTime,
      fields.location, fields.coordinates?.latitude ?? null, fields.coordinates?.longitude ?? null,
      fields.capacity, fields.status, Number(fields.waitlistEnabled), timestamp, timestamp)
    return this.find(eventId)!
  }

  update(eventId: string, organizerId: string, fields: EventFields, timestamp: string) {
    this.db.prepare(`
      UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, location = ?, latitude = ?, longitude = ?,
        capacity = ?, status = ?, waitlist_enabled = ?, updated_at = ? WHERE event_id = ? AND organizer_id = ?
    `).run(fields.title, fields.description, fields.startTime, fields.endTime,
      fields.location, fields.coordinates?.latitude ?? null, fields.coordinates?.longitude ?? null,
      fields.capacity, fields.status, Number(fields.waitlistEnabled), timestamp, eventId, organizerId)
    return this.find(eventId)!
  }

  delete(eventId: string, organizerId: string) {
    this.db.prepare('DELETE FROM events WHERE event_id = ? AND organizer_id = ?').run(eventId, organizerId)
  }

  write<T>(work: () => T) {
    return transaction(this.db, work)
  }
}
