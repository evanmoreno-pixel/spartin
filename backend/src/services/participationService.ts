import type { CampusEvent, ParticipationAction, ParticipationResult } from '../../../shared/contracts.js'
import { HttpError } from '../api/httpError.js'
import { EventRepository, eventPageSize } from '../data/eventRepository.js'
import { ParticipationRepository } from '../data/participationRepository.js'
import { isEventAvailable } from './eventValidation.js'

export class ParticipationService {
  constructor(private readonly events: EventRepository, private readonly participation: ParticipationRepository) {}

  get(eventId: string, userId: string) {
    this.findEvent(eventId)
    return this.participation.find(eventId, userId)
  }

  forEvent(event: CampusEvent, userId: string) {
    return { ...event, participation: this.participation.find(event.eventId, userId) }
  }

  list(userId: string, page: number) {
    const events = this.events.listParticipating(userId, eventPageSize + 1, (page - 1) * eventPageSize)
    return {
      data: events.slice(0, eventPageSize).map(event => this.forEvent(event, userId)),
      pagination: { page, hasNext: events.length > eventPageSize },
    }
  }

  private findEvent(eventId: string) {
    const event = this.events.find(eventId)
    if (!event) throw new HttpError(404, 'EVENT_NOT_FOUND', 'This event is no longer available.')
    return event
  }

  // Called within the same write transaction as the capacity change or departure.
  promoteWaiting(event: CampusEvent, now: string) {
    if (!event.waitlistedCount || !isEventAvailable(event, now)) return
    const availableSpots = event.capacity === null ? -1 : Math.max(0, event.capacity - event.joinedCount)
    if (availableSpots !== 0) this.participation.promote(event.eventId, availableSpots, now)
  }

  act(action: ParticipationAction, eventId: string, userId: string): ParticipationResult {
    return this.events.write(() => {
      const event = this.findEvent(eventId)
      const current = this.participation.find(eventId, userId)
      const now = new Date().toISOString()

      if (action === 'leave') {
        if (current.status === 'left') return { ...current, outcome: 'LEFT' }
        if (current.status !== 'joined' && current.status !== 'waitlisted') {
          throw new HttpError(409, 'NOT_PARTICIPATING', 'Join the event or its waitlist before leaving.')
        }
        const left = this.participation.save(eventId, userId, 'left', now)
        if (current.status === 'joined') this.promoteWaiting({ ...event, joinedCount: event.joinedCount - 1 }, now)
        return { ...left, outcome: 'LEFT' }
      }

      if (!isEventAvailable(event, now)) {
        throw new HttpError(409, 'EVENT_UNAVAILABLE', 'This event is postponed or has ended.')
      }

      if (action === 'pass') {
        if (current.status === 'joined' || current.status === 'waitlisted') {
          throw new HttpError(409, 'LEAVE_REQUIRED', 'Use Leave event to give up your spot or waitlist position.')
        }
        const passed = current.status === 'passed' ? current : this.participation.save(eventId, userId, 'passed', now)
        return { ...passed, outcome: 'PASSED' }
      }

      if (current.status === 'joined') return { ...current, outcome: 'ALREADY_JOINED' }
      if (current.status === 'waitlisted') return { ...current, outcome: 'WAITLISTED' }
      if (event.capacity === null || event.joinedCount < event.capacity) {
        return { ...this.participation.save(eventId, userId, 'joined', now), outcome: 'JOINED' }
      }
      if (!event.waitlistEnabled) throw new HttpError(409, 'FULL', 'This event is full and its waitlist is closed.')
      return { ...this.participation.save(eventId, userId, 'waitlisted', now), outcome: 'WAITLISTED' }
    })
  }
}
