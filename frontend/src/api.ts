import type { CampusEvent, DemoAccount, EventFields, ParticipationAction, ParticipationResult, User } from '../../shared/contracts'

export const sessionEnded = 'spartin:session-ended'

export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly fields?: Record<string, string>) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (response.status === 204) return undefined as T
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    if (response.status === 401) window.dispatchEvent(new Event(sessionEnded))
    throw new ApiError(response.status, body?.error?.message ?? 'SpartIN could not complete the request. Try again.', body?.error?.fields)
  }
  return response.json()
}

export interface EventPage {
  data: CampusEvent[]
  pagination: { page: number; hasNext: boolean }
}

export async function session(signal?: AbortSignal) {
  return (await request<{ data: User }>('/session', { signal })).data
}

export async function listAccounts(signal?: AbortSignal) {
  return (await request<{ data: DemoAccount[] }>('/demo-accounts', { signal })).data
}

export async function signIn(accountKey: string) {
  return (await request<{ data: User }>('/session', { method: 'POST', body: JSON.stringify({ accountKey }) })).data
}

export function signOut() {
  return request<void>('/session', { method: 'DELETE' })
}

export function listEvents(organizer: boolean, page: number, signal?: AbortSignal) {
  return request<EventPage>(`${organizer ? '/organizer/events' : '/events'}?page=${page}`, { signal })
}

export async function listCalendarEvents(signal: AbortSignal) {
  const events = new Map<string, CampusEvent>()
  let page = 1
  let hasNext: boolean
  do {
    const result = await listEvents(false, page, signal)
    for (const event of result.data) events.set(event.eventId, event)
    hasNext = result.pagination.hasNext
    page += 1
  } while (hasNext)
  return [...events.values()]
}

export function listDiscovery(signal: AbortSignal) {
  return request<EventPage>('/events/discovery', { signal })
}

export function listParticipation(page: number, signal: AbortSignal) {
  return request<EventPage>(`/me/participation?page=${page}`, { signal })
}

export async function actOnEvent(eventId: string, action: ParticipationAction) {
  return (await request<{ data: ParticipationResult }>(`/events/${encodeURIComponent(eventId)}/${action}`, {
    method: 'POST',
  })).data
}

export async function getEvent(id: string, signal?: AbortSignal) {
  return (await request<{ data: CampusEvent }>(`/events/${encodeURIComponent(id)}`, { signal })).data
}

export async function saveEvent(fields: Partial<EventFields>, id?: string) {
  return (await request<{ data: CampusEvent }>(id ? `/events/${encodeURIComponent(id)}` : '/events', {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(fields),
  })).data
}

export function deleteEvent(id: string) {
  return request<void>(`/events/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Could not connect to SpartIN. Try again.'
}
