import { CalendarPlus, Download } from 'lucide-react'
import { useState } from 'react'
import type { CampusEvent } from '../../shared/contracts'
import { downloadCalendar, googleCalendarUrl } from './calendar'
import { Notice } from './ui'

export function CalendarActions({ event }: { event: CampusEvent }) {
  const [error, setError] = useState('')
  const googleUrl = googleCalendarUrl(event)

  function download() {
    setError('')
    try {
      if (downloadCalendar(event)) return
    } catch {
      // The Google Calendar link remains available if the browser prevents a download.
    }
    setError('The calendar file could not be downloaded. Try again or open Google Calendar.')
  }

  return (
    <section className="event-description" aria-labelledby="calendar-heading">
      <h2 id="calendar-heading">Calendar</h2>
      {googleUrl ? (
        <div className="event-tools">
          <a className="button secondary" href={googleUrl} target="_blank" rel="noopener noreferrer">
            <CalendarPlus size={17} aria-hidden="true" /> Add to Google Calendar
          </a>
          <button type="button" className="button secondary" onClick={download}>
            <Download size={17} aria-hidden="true" /> Download calendar file
          </button>
        </div>
      ) : <p>Calendar export requires a valid start and end time.</p>}
      {error && <Notice error>{error}</Notice>}
    </section>
  )
}
