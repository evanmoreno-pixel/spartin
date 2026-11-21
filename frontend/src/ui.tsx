import { CalendarDays, CircleAlert, GraduationCap } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CampusEvent } from '../../shared/contracts'
import { errorMessage } from './api'

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link className="brand" to={to} aria-label="SpartIN home">
      <span className="brand-mark"><GraduationCap size={23} aria-hidden="true" /></span>
      <span>Spart<span className="brand-accent">IN</span></span>
    </Link>
  )
}

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={error ? 'notice notice-error' : 'notice'} role={error ? 'alert' : 'status'}>{children}</div>
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return <div className="feedback" role="status"><span className="spinner" aria-hidden="true" />{label}</div>
}

export function LoadError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="feedback">
      <CircleAlert size={23} aria-hidden="true" />
      <p role="alert">{errorMessage(error)}</p>
      <button type="button" className="button secondary" onClick={retry}>Try again</button>
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  const titleId = useId()
  return (
    <section className="feedback empty" aria-labelledby={titleId}>
      <span className="feedback-icon"><CalendarDays size={24} aria-hidden="true" /></span>
      <h2 id={titleId}>{title}</h2>
      {children}
    </section>
  )
}

export function EventStatus({ event }: { event: CampusEvent }) {
  const label = event.status === 'postponed' ? 'Postponed' : Date.parse(event.endTime) <= Date.now() ? 'Ended' : 'Scheduled'
  return <span className={`status-tag ${label.toLowerCase()}`}><span aria-hidden="true" />{label}</span>
}

export function capacityText(capacity: number | null) {
  if (capacity === null) return 'No capacity limit'
  return `Capacity: ${capacity}`
}
