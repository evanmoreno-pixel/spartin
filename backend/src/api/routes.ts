import { json, Router, type CookieOptions, type Request, type RequestHandler } from 'express'
import type { User } from '../../../shared/contracts.js'
import { DemoSessions, sessionCookie, sessionLifetimeMs } from '../services/demoSessions.js'
import { EventService } from '../services/eventService.js'
import { ParticipationService } from '../services/participationService.js'
import { HttpError } from './httpError.js'

const cookieOptions: CookieOptions = { httpOnly: true, sameSite: 'strict', path: '/api' }
const parseJson = json({ limit: '48kb' })
const readMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

const requireSameOriginForWrites: RequestHandler = (req, _res, next) => {
  const source = req.get('origin')
  const site = req.get('sec-fetch-site')
  if (!readMethods.has(req.method) && (
    (source && source !== `${req.protocol}://${req.get('host')}`)
    || site === 'cross-site' || site === 'same-site'
  )) {
    throw new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Open SpartIN directly to perform this action.')
  }
  next()
}

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

export function createApi(sessions: DemoSessions, events: EventService, participation: ParticipationService) {
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

  const requireParticipant: RequestHandler = (_req, res, next) => {
    if (res.locals.user.role !== 'participant') {
      throw new HttpError(403, 'PARTICIPANT_REQUIRED', 'This action requires a participant account.')
    }
    next()
  }

  api.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  api.use(requireSameOriginForWrites)

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

  api.get('/events/discovery', requireSession, requireParticipant, (req, res) => {
    res.json(events.list(pageNumber(req), undefined, res.locals.user.userId))
  })

  api.get('/events/:id', requireSession, (req, res) => {
    const user = res.locals.user as User
    const event = events.get(eventId(req), user)
    res.json({ data: user.role === 'participant'
      ? participation.forEvent(event, user.userId)
      : event })
  })

  api.get('/me/participation', requireSession, requireParticipant, (req, res) => {
    res.json(participation.list(res.locals.user.userId, pageNumber(req)))
  })

  api.get('/events/:id/participation', requireSession, requireParticipant, (req, res) => {
    res.json({ data: participation.get(eventId(req), res.locals.user.userId) })
  })

  for (const action of ['join', 'pass', 'leave'] as const) {
    api.post(`/events/:id/${action}`, requireSession, requireParticipant, (req, res) => {
      res.json({ data: participation.act(action, eventId(req), res.locals.user.userId) })
    })
  }

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
