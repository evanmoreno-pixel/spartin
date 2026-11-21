import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import type { ParticipationState, ParticipationStatus } from '../../../shared/contracts.js'

export class ParticipationRepository {
  constructor(private readonly db: DatabaseSync) {}

  find(eventId: string, userId: string): ParticipationState {
    const row = this.db.prepare(`
      SELECT p.status, CASE WHEN p.status = 'waitlisted' THEN (
        SELECT count(*) FROM participation w
        WHERE w.event_id = p.event_id AND w.status = 'waitlisted' AND w.waitlist_order <= p.waitlist_order
      ) END AS waitlistPosition
      FROM participation p WHERE p.event_id = ? AND p.user_id = ?
    `).get(eventId, userId)
    return (row as ParticipationState | undefined) ?? { status: null, waitlistPosition: null }
  }

  save(eventId: string, userId: string, status: ParticipationStatus, now: string) {
    const order = status === 'waitlisted'
      ? this.db.prepare('UPDATE waitlist_sequence SET last_order = last_order + 1 WHERE id = 1 RETURNING last_order').get()!.last_order
      : null
    this.db.prepare(`
      INSERT INTO participation (participation_id, event_id, user_id, status, created_at, updated_at, waitlist_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, event_id) DO UPDATE SET status = excluded.status,
        updated_at = excluded.updated_at, waitlist_order = excluded.waitlist_order
    `).run(randomUUID(), eventId, userId, status, now, now, order)
    return this.find(eventId, userId)
  }

  promote(eventId: string, limit: number, now: string) {
    this.db.prepare(`
      UPDATE participation SET status = 'joined', updated_at = ?, waitlist_order = NULL
      WHERE participation_id IN (
        SELECT participation_id FROM participation
        WHERE event_id = ? AND status = 'waitlisted' ORDER BY waitlist_order LIMIT ?
      )
    `).run(now, eventId, limit)
  }
}
