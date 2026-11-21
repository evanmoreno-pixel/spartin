import { useRef, useState } from 'react'
import type { CampusEvent, ParticipationAction, ParticipationResult, ParticipationState } from '../../shared/contracts'
import { actOnEvent, errorMessage } from './api'
import { Notice } from './ui'

export function participationLabel(state: ParticipationState) {
  switch (state.status) {
    case 'joined': return 'Joined'
    case 'waitlisted': return `Waitlisted · position ${state.waitlistPosition}`
    case 'passed': return 'Passed'
    case 'left': return 'Left'
    default: return 'Not joined'
  }
}

function confirmation(result: ParticipationResult) {
  switch (result.outcome) {
    case 'JOINED': return 'You joined the event.'
    case 'ALREADY_JOINED': return 'You’re already joined.'
    case 'WAITLISTED': return `You’re on the waitlist at position ${result.waitlistPosition}.`
    case 'PASSED': return 'Event passed.'
    case 'LEFT': return 'You left the event.'
  }
}

export function useParticipationAction(onSuccess: (eventId: string) => void) {
  const locked = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(eventId: string, action: ParticipationAction) {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await actOnEvent(eventId, action)
      setNotice(confirmation(result))
      onSuccess(eventId)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  return { submit, busy, notice, error }
}

export function JoinPassButtons({ event, busy, onAction }: {
  event: CampusEvent; busy: boolean; onAction: (action: 'join' | 'pass') => void
}) {
  const waitlist = event.waitlistEnabled && event.capacity !== null && event.joinedCount >= event.capacity
  return (
    <>
      <button type="button" className="button secondary" disabled={busy} onClick={() => onAction('pass')}>Pass</button>
      <button type="button" className="button primary" disabled={busy} onClick={() => onAction('join')}>
        {waitlist ? 'Join waitlist' : 'Join'}
      </button>
    </>
  )
}

export function DetailParticipation({ event, refresh, refreshing }: { event: CampusEvent; refresh: () => void; refreshing: boolean }) {
  const action = useParticipationAction(refresh)
  const state = event.participation!
  const active = state.status === 'joined' || state.status === 'waitlisted'
  const busy = action.busy || refreshing
  return (
    <section className="event-description" aria-labelledby="participation-heading">
      <h2 id="participation-heading">Your participation</h2>
      <p>{participationLabel(state)}</p>
      {action.error && <Notice error>{action.error}</Notice>}
      {action.notice && <Notice>{action.notice}</Notice>}
      <div className="participation-actions">
        {active ? (
          <button type="button" className="button secondary" disabled={busy}
            onClick={() => void action.submit(event.eventId, 'leave')}>Leave event</button>
        ) : (
          <JoinPassButtons event={event} busy={busy} onAction={choice => void action.submit(event.eventId, choice)} />
        )}
      </div>
    </section>
  )
}
