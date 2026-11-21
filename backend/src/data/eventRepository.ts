import type { DatabaseSync } from 'node:sqlite'
import type { CampusEvent, EventFields } from '../../../shared/contracts.js'
import { transaction } from './database.js'

const eventQuery = `
  SELECT e.event_id AS eventId, e.organizer_id AS organizerId, u.display_name AS organizerDisplayName,
    e.title, e.description, e.start_time AS startTime, e.end_time AS endTime,
    e.location, e.capacity, e.status, e.created_at AS createdAt, e.updated_at AS updatedAt
  FROM events e JOIN users u ON e.organizer_id = u.user_id
`

export class EventRepository {
  constructor(private readonly db: DatabaseSync) {}

  listAvailable(now: string, limit: number, offset: number) {
    return this.db.prepare(`${eventQuery} WHERE e.status = 'scheduled' AND e.end_time > ?
      ORDER BY e.start_time, e.event_id LIMIT ? OFFSET ?`)
      .all(now, limit, offset) as unknown as CampusEvent[]
  }

  listOwned(organizerId: string, limit: number, offset: number) {
    return this.db.prepare(`${eventQuery} WHERE e.organizer_id = ?
      ORDER BY e.start_time, e.event_id LIMIT ? OFFSET ?`)
      .all(organizerId, limit, offset) as unknown as CampusEvent[]
  }

  find(eventId: string) {
    return this.db.prepare(`${eventQuery} WHERE e.event_id = ?`).get(eventId) as CampusEvent | undefined
  }

  create(eventId: string, organizerId: string, fields: EventFields, timestamp: string) {
    this.db.prepare(`
      INSERT INTO events (event_id, organizer_id, title, description, start_time, end_time,
        location, capacity, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, organizerId, fields.title, fields.description, fields.startTime, fields.endTime,
      fields.location, fields.capacity, fields.status, timestamp, timestamp)
    return this.find(eventId)!
  }

  update(eventId: string, organizerId: string, fields: EventFields, timestamp: string) {
    this.db.prepare(`
      UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, location = ?,
        capacity = ?, status = ?, updated_at = ? WHERE event_id = ? AND organizer_id = ?
    `).run(fields.title, fields.description, fields.startTime, fields.endTime,
      fields.location, fields.capacity, fields.status, timestamp, eventId, organizerId)
    return this.find(eventId)!
  }

  delete(eventId: string, organizerId: string) {
    this.db.prepare('DELETE FROM events WHERE event_id = ? AND organizer_id = ?').run(eventId, organizerId)
  }

  write<T>(work: () => T) {
    return transaction(this.db, work)
  }
}
