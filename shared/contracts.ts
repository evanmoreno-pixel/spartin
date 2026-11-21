export type Role = 'organizer' | 'participant'
export type EventStatus = 'scheduled' | 'postponed'
export type ParticipationStatus = 'joined' | 'waitlisted' | 'passed' | 'left'
export type ParticipationAction = 'join' | 'pass' | 'leave'

export interface ParticipationState {
  status: ParticipationStatus | null
  waitlistPosition: number | null
}

export interface ParticipationResult extends ParticipationState {
  outcome: 'JOINED' | 'ALREADY_JOINED' | 'WAITLISTED' | 'PASSED' | 'LEFT'
}

export interface User {
  userId: string
  displayName: string
  role: Role
}

export interface DemoAccount {
  accountKey: string
  displayName: string
  role: Role
}

export interface EventFields {
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  capacity: number | null
  waitlistEnabled: boolean
  status: EventStatus
}

export interface CampusEvent extends EventFields {
  eventId: string
  organizerId: string
  organizerDisplayName: string
  createdAt: string
  updatedAt: string
  joinedCount: number
  waitlistedCount: number
  participation?: ParticipationState
}
