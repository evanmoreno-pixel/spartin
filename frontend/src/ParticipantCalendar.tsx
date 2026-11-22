import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { CampusEvent } from '../../shared/contracts'
import { listCalendarEvents } from './api'
import {
  addDays, calendarViews, dateKey, dayFormat, groupCalendarEvents, monthFormat, monthName, monthWeeks,
  parseCalendarDate, periodRange, shiftPeriod, shortDateFormat, weekdayLabels, yearMonths, type CalendarView,
} from './calendarDates'
import { eventTimeLabel } from './dates'
import { LoadError, Loading } from './ui'
import { useResource } from './useResource'
import './participantCalendar.css'

const emptyEvents: CampusEvent[] = []
const weekFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const zonedTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
const monthPreviewLimit = 2
type DailyEvents = ReturnType<typeof groupCalendarEvents>

function eventCount(count: number) {
  return `${count} ${count === 1 ? 'event' : 'events'}`
}

function EventLink({ event, calendarSearch }: { event: CampusEvent; calendarSearch: string }) {
  return (
    <Link className="calendar-event-link" to={`/participant/events/${encodeURIComponent(event.eventId)}`} state={{ calendarSearch }}>
      {event.title}
    </Link>
  )
}

function CalendarAgenda({ events, calendarSearch, showEnd }: { events: CampusEvent[]; calendarSearch: string; showEnd: boolean }) {
  if (!events.length) return <p className="calendar-empty">No events scheduled.</p>
  return (
    <ul className="calendar-agenda">
      {events.map(event => {
        const start = new Date(event.startTime)
        const end = new Date(event.endTime)
        const multiDay = dateKey(start) !== dateKey(end)
        const changesOffset = start.getTimezoneOffset() !== end.getTimezoneOffset()
        const time = (date: Date, stamp: string) => {
          const label = changesOffset ? zonedTime.format(date) : eventTimeLabel(stamp)
          return multiDay ? `${shortDateFormat.format(date)}, ${label}` : label
        }
        return (
          <li key={event.eventId}>
            <EventLink event={event} calendarSearch={calendarSearch} />
            <p><time dateTime={event.startTime}>{time(start, event.startTime)}</time>{showEnd && <>
              {' – '}<time dateTime={event.endTime}>{time(end, event.endTime)}</time>
            </>}</p>
            <p>{event.location}</p>
          </li>
        )
      })}
    </ul>
  )
}

function MonthCalendar({ date, todayKey, days, selectDate, calendarSearch }: {
  date: Date; todayKey: string; days: DailyEvents; selectDate: (date: Date) => void; calendarSearch: string;
}) {
  const selectedKey = dateKey(date)
  return (
    <>
      <table className="calendar-month" aria-labelledby="calendar-period">
        <thead><tr>{weekdayLabels.map(day => <th key={day} scope="col">{day}</th>)}</tr></thead>
        <tbody>{monthWeeks(date).map((week, row) => (
          <tr key={row}>{week.map((day, column) => {
            if (!day) return <td className="calendar-outside" key={column} />
            const key = dateKey(day)
            const events = days.get(key) ?? emptyEvents
            return (
              <td key={column} className="calendar-month-cell">
                <button className="calendar-date" type="button" aria-pressed={key === selectedKey}
                  aria-current={key === todayKey ? 'date' : undefined} aria-label={`${dayFormat.format(day)}, ${eventCount(events.length)}`}
                  onClick={() => selectDate(day)}>
                  <span>{day.getDate()}</span>
                  {events.length > 0 && <span className="calendar-cell-count" aria-hidden="true">{events.length}</span>}
                </button>
                {events.length > 0 && <ul className="calendar-preview">
                  {events.slice(0, monthPreviewLimit).map(event => (
                    <li key={event.eventId}><EventLink event={event} calendarSearch={calendarSearch} /></li>
                  ))}
                  {events.length > monthPreviewLimit && <li className="calendar-overflow">+{events.length - monthPreviewLimit} more</li>}
                </ul>}
              </td>
            )
          })}</tr>
        ))}</tbody>
      </table>
      <section className="calendar-selection" aria-labelledby="calendar-selection-title">
        <h4 id="calendar-selection-title" aria-live="polite">{dayFormat.format(date)}</h4>
        <CalendarAgenda events={days.get(selectedKey) ?? emptyEvents} calendarSearch={calendarSearch} showEnd />
      </section>
    </>
  )
}

function WeekCalendar({ start, todayKey, days, openDay, calendarSearch }: {
  start: Date; todayKey: string; days: DailyEvents; openDay: (date: Date) => void; calendarSearch: string;
}) {
  return (
    <div className="calendar-week">
      {weekdayLabels.map((weekday, index) => {
        const day = addDays(start, index)
        const key = dateKey(day)
        return (
          <section key={key} aria-labelledby={`calendar-day-${key}`}>
            <h4 id={`calendar-day-${key}`}>
              <button type="button" className="calendar-date" aria-label={`Open ${dayFormat.format(day)}`}
                aria-current={key === todayKey ? 'date' : undefined} onClick={() => openDay(day)}>
                {weekday} {shortDateFormat.format(day)}
              </button>
            </h4>
            <CalendarAgenda events={days.get(key) ?? emptyEvents} calendarSearch={calendarSearch} showEnd={false} />
          </section>
        )
      })}
    </div>
  )
}

function YearCalendar({ date, days, todayKey, openMonth }: {
  date: Date; days: DailyEvents; todayKey: string; openMonth: (date: Date) => void;
}) {
  return (
    <div className="calendar-year">
      {yearMonths(date).map(month => {
        const name = monthName.format(month)
        return (
          <section key={name} className="calendar-mini-month" aria-label={name}>
            <h4><button type="button" className="calendar-date" onClick={() => openMonth(month)}>{name}</button></h4>
            <table aria-label={name}>
              <thead><tr>{weekdayLabels.map(day => <th key={day} scope="col" aria-label={day}>{day[0]}</th>)}</tr></thead>
              <tbody>{monthWeeks(month).map((week, index) => (
                <tr key={index}>{week.map((day, column) => {
                  if (!day) return <td key={column} />
                  const key = dateKey(day)
                  const count = days.get(key)?.length ?? 0
                  return (
                    <td key={column} className={count ? 'calendar-has-events' : undefined}
                      aria-label={`${dayFormat.format(day)}, ${eventCount(count)}`} aria-current={key === todayKey ? 'date' : undefined}>
                      <time dateTime={key}>{day.getDate()}</time>
                    </td>
                  )
                })}</tr>
              ))}</tbody>
            </table>
          </section>
        )
      })}
    </div>
  )
}

export function ParticipantCalendar() {
  const [params, setParams] = useSearchParams()
  const periodHeading = useRef<HTMLHeadingElement>(null)
  const events = useResource(listCalendarEvents, true)
  const today = new Date()
  const todayKey = dateKey(today)
  const view = calendarViews.find(option => option.toLowerCase() === params.get('view')) ?? 'Month'
  const requestedDate = params.get('date')
  const date = useMemo(() => parseCalendarDate(requestedDate) ?? new Date(), [requestedDate, todayKey])
  const selectedKey = dateKey(date)
  const range = useMemo(() => periodRange(date, view), [date, view])
  const days = useMemo(() => groupCalendarEvents(events.data ?? emptyEvents, range), [events.data, range])
  const calendarSearch = `?${new URLSearchParams({ view: view.toLowerCase(), date: selectedKey })}`
  const periodLabel = view === 'Day' ? dayFormat.format(date)
    : view === 'Week' ? weekFormat.formatRange(range[0], addDays(range[1], -1))
      : view === 'Month' ? monthFormat.format(date) : date.getFullYear()
  const previous = shiftPeriod(date, view, -1)
  const next = shiftPeriod(date, view, 1)

  function show(nextDate: Date, nextView = view) {
    setParams({ view: nextView.toLowerCase(), date: dateKey(nextDate) }, { replace: true })
  }

  function openView(nextDate: Date, nextView: CalendarView) {
    show(nextDate, nextView)
    periodHeading.current?.focus()
  }

  return (
    <section className="events-section calendar-page" aria-labelledby="calendar-title">
      <div className="section-heading">
        <h2 id="calendar-title">Calendar</h2>
        <button type="button" className="button secondary" onClick={events.refresh} disabled={events.refreshing}>Refresh events</button>
      </div>
      <div className="panel calendar-panel">
        <div className="calendar-toolbar">
          <div className="calendar-controls" role="group" aria-label="Calendar view">
            {calendarViews.map(option => (
              <button type="button" key={option} className={`button ${option === view ? 'primary' : 'secondary'}`}
                aria-pressed={option === view} onClick={() => show(date, option)}>{option}</button>
            ))}
          </div>
          <div className="calendar-controls" role="group" aria-label="Calendar date navigation">
            <button type="button" className="button secondary" onClick={() => show(previous)}
              disabled={previous.getFullYear() < 1} aria-label={`Previous ${view.toLowerCase()}`}><ChevronLeft size={18} aria-hidden="true" /></button>
            <button type="button" className="button secondary" onClick={() => show(today)}>Today</button>
            <button type="button" className="button secondary" onClick={() => show(next)}
              disabled={next.getFullYear() > 9999} aria-label={`Next ${view.toLowerCase()}`}><ChevronRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="calendar-period">
          <h3 id="calendar-period" ref={periodHeading} tabIndex={-1} aria-live="polite"
            aria-current={view === 'Day' && selectedKey === todayKey ? 'date' : undefined}>{periodLabel}</h3>
          {view === 'Day' && selectedKey === todayKey && <span className="calendar-today" aria-hidden="true">Today</span>}
        </div>
        {events.pending && <Loading label="Loading calendar events…" />}
        {!!events.error && <LoadError error={events.error} retry={events.refresh} />}
        {events.data && <>
          {view === 'Month' && <MonthCalendar date={date} todayKey={todayKey} days={days} selectDate={show} calendarSearch={calendarSearch} />}
          {view === 'Week' && <WeekCalendar start={range[0]} todayKey={todayKey} days={days} openDay={day => openView(day, 'Day')} calendarSearch={calendarSearch} />}
          {view === 'Day' && <CalendarAgenda events={days.get(selectedKey) ?? emptyEvents} calendarSearch={calendarSearch} showEnd />}
          {view === 'Year' && <YearCalendar date={date} days={days} todayKey={todayKey} openMonth={month => openView(month, 'Month')} />}
        </>}
      </div>
    </section>
  )
}
