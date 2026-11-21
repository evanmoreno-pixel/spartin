import { json, Router, type CookieOptions, type Request, type RequestHandler } from 'express'
import type { User } from '../../../shared/contracts.js'
import { DemoSessions, sessionCookie, sessionLifetimeMs } from '../services/demoSessions.js'
import { EventService } from '../services/eventService.js'
import { HttpError } from './httpError.js'

const cookieOptions: CookieOptions = { httpOnly: true, sameSite: 'strict', path: '/api' }
const parseJson = json({ limit: '48kb' })

function getToken(req: Request) {
  return /(?:^|;\s*)spartin_demo_session=([\w-]{43})(?:;|$)/.exec(req.get('cookie') ?? '')?.[1]
}

function eventId(req: Request) {
  const id = req.params.id
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(id)) {
    throw new HttpError(400, 'INVALID_EVENT_ID', 'Enter a valid event ID.')
  }
  return id
}

function pageNumber(req: Request) {
  const page = req.query.page
  if (page === undefined) return 1
  if (typeof page !== 'string' || !/^[1-9]\d{0,6}$/.test(page)) {
    throw new HttpError(400, 'INVALID_PAGE', 'Page must be a positive integer of up to seven digits.')
  }
  return Number(page)
}

export function createApi(sessions: DemoSessions, events: EventService) {
  const api = Router()

  const requireSession: RequestHandler = (req, res, next) => {
    const user = sessions.user(getToken(req))
    if (!user) throw new HttpError(401, 'SESSION_REQUIRED', 'Select a demo account to continue.')
    res.locals.user = user
    next()
  }

  const requireOrganizer: RequestHandler = (_req, res, next) => {
    if (res.locals.user.role !== 'organizer') {
      throw new HttpError(403, 'ORGANIZER_REQUIRED', 'This action requires an organizer account.')
    }
    next()
  }

  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  api.get('/demo-accounts', (_req, res) => {
    res.json({ data: sessions.accounts() })
  })

  api.post('/session', parseJson, (req, res) => {
    const { token, user } = sessions.signIn(req.body, getToken(req))
    res.cookie(sessionCookie, token, { ...cookieOptions, maxAge: sessionLifetimeMs })
    res.json({ data: user })
  })

  api.get('/session', requireSession, (_req, res) => {
    res.json({ data: res.locals.user })
  })

  api.delete('/session', (req, res) => {
    sessions.signOut(getToken(req))
    res.clearCookie(sessionCookie, cookieOptions).status(204).end()
  })

  api.get('/events', requireSession, (req, res) => {
    res.json(events.list(pageNumber(req)))
  })

  api.get('/events/:id', requireSession, (req, res) => {
    res.json({ data: events.get(eventId(req), res.locals.user as User) })
  })

  api.get('/organizer/events', requireSession, requireOrganizer, (req, res) => {
    res.json(events.list(pageNumber(req), res.locals.user.userId))
  })

  api.post('/events', requireSession, requireOrganizer, parseJson, (req, res) => {
    const event = events.create(res.locals.user.userId, req.body)
    res.location(`/api/events/${event.eventId}`).status(201).json({ data: event })
  })

  api.patch('/events/:id', requireSession, requireOrganizer, parseJson, (req, res) => {
    res.json({ data: events.update(eventId(req), res.locals.user.userId, req.body) })
  })

  api.delete('/events/:id', requireSession, requireOrganizer, (req, res) => {
    events.delete(eventId(req), res.locals.user.userId)
    res.status(204).end()
  })

  api.use((_req, _res) => {
    throw new HttpError(404, 'API_NOT_FOUND', 'This API endpoint does not exist.')
  })
  return api
}
