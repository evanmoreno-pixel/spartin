import { randomUUID } from 'node:crypto'
import type { User } from '../../../shared/contracts.js'
import { HttpError } from '../api/httpError.js'
import { EventRepository, eventPageSize } from '../data/eventRepository.js'
import { isEventAvailable, validateEvent } from './eventValidation.js'
import { ParticipationService } from './participationService.js'

const notFound = () => new HttpError(404, 'EVENT_NOT_FOUND', 'This event is no longer available.')

export class EventService {
  constructor(private readonly repository: EventRepository, private readonly participation: ParticipationService) {}

  list(page: number, ownerId?: string, discoveryUserId?: string) {
    const offset = (page - 1) * eventPageSize
    const events = ownerId
      ? this.repository.listOwned(ownerId, eventPageSize + 1, offset)
      : this.repository.listAvailable(new Date().toISOString(), eventPageSize + 1, offset, discoveryUserId)
    const data = events.slice(0, eventPageSize)
    return {
      data: discoveryUserId ? data.map(event => this.participation.forEvent(event, discoveryUserId)) : data,
      pagination: { page, hasNext: events.length > eventPageSize },
    }
  }

  get(eventId: string, user: User) {
    const event = this.repository.find(eventId)
    if (!event) throw notFound()
    const isOwner = user.role === 'organizer' && event.organizerId === user.userId
    const isAvailable = isEventAvailable(event, new Date().toISOString())
    if (!isOwner && !isAvailable) throw notFound()
    return event
  }

  private ownedEvent(eventId: string, organizerId: string) {
    const event = this.repository.find(eventId)
    if (!event) throw notFound()
    if (event.organizerId !== organizerId) {
      throw new HttpError(403, 'NOT_EVENT_OWNER', 'Only the event organizer can change this event.')
    }
    return event
  }

  create(organizerId: string, body: unknown) {
    const fields = validateEvent(body)
    return this.repository.create(randomUUID(), organizerId, fields, new Date().toISOString())
  }

  update(eventId: string, organizerId: string, body: unknown) {
    return this.repository.write(() => {
      const current = this.ownedEvent(eventId, organizerId)
      const fields = validateEvent(body, current)
      if (fields.capacity !== null && fields.capacity < current.joinedCount) {
        throw new HttpError(409, 'CAPACITY_BELOW_JOINED', 'Capacity cannot be lower than the number of joined participants.', {
          capacity: `Enter at least ${current.joinedCount}, or leave capacity blank.`,
        })
      }
      const now = new Date().toISOString()
      const updated = this.repository.update(eventId, organizerId, fields, now)
      this.participation.promoteWaiting(updated, now)
      return this.repository.find(eventId)!
    })
  }

  delete(eventId: string, organizerId: string) {
    this.repository.write(() => {
      this.ownedEvent(eventId, organizerId)
      this.repository.delete(eventId, organizerId)
    })
  }
}
