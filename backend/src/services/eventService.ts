import { randomUUID } from 'node:crypto'
import type { User } from '../../../shared/contracts.js'
import { HttpError } from '../api/httpError.js'
import { EventRepository } from '../data/eventRepository.js'
import { validateEvent } from './eventValidation.js'

const pageSize = 24
const notFound = () => new HttpError(404, 'EVENT_NOT_FOUND', 'This event is no longer available.')

export class EventService {
  constructor(private readonly repository: EventRepository) {}

  list(page: number, ownerId?: string) {
    const offset = (page - 1) * pageSize
    const events = ownerId
      ? this.repository.listOwned(ownerId, pageSize + 1, offset)
      : this.repository.listAvailable(new Date().toISOString(), pageSize + 1, offset)
    return { data: events.slice(0, pageSize), pagination: { page, hasNext: events.length > pageSize } }
  }

  get(eventId: string, user: User) {
    const event = this.repository.find(eventId)
    if (!event) throw notFound()
    const isOwner = user.role === 'organizer' && event.organizerId === user.userId
    const isAvailable = event.status === 'scheduled' && event.endTime > new Date().toISOString()
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
      return this.repository.update(eventId, organizerId, fields, new Date().toISOString())
    })
  }

  delete(eventId: string, organizerId: string) {
    this.repository.write(() => {
      this.ownedEvent(eventId, organizerId)
      this.repository.delete(eventId, organizerId)
    })
  }
}
