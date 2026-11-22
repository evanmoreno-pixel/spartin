import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import express, { type ErrorRequestHandler } from 'express'
import { HttpError } from './api/httpError.js'
import { createApi } from './api/routes.js'
import { EventRepository } from './data/eventRepository.js'
import { ParticipationRepository } from './data/participationRepository.js'
import { DemoSessions, type DemoDirectory } from './services/demoSessions.js'
import { EventService } from './services/eventService.js'
import { ParticipationService } from './services/participationService.js'

export function createApp(db: DatabaseSync, options: {
  clientDirectory?: string
  sessionClock?: () => number
  demoDirectory?: DemoDirectory
  allowedOrigins?: ReadonlySet<string>
} = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff')
    next()
  })
  const events = new EventRepository(db)
  const participation = new ParticipationService(events, new ParticipationRepository(db))
  app.use('/api', createApi(
    new DemoSessions(db, options.sessionClock, options.demoDirectory),
    new EventService(events, participation),
    participation,
    options.allowedOrigins,
  ))

  const { clientDirectory } = options
  if (clientDirectory) {
    app.use(express.static(clientDirectory))
    app.get('/{*path}', (req, res, next) => {
      if (!req.accepts('html') || req.path.startsWith('/assets/')) return next()
      res.sendFile(join(clientDirectory, 'index.html'))
    })
  }

  app.use((_req, _res) => {
    throw new HttpError(404, 'NOT_FOUND', 'This page does not exist.')
  })

  const handleError: ErrorRequestHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message, fields: error.fields } })
      return
    }
    if (error.type === 'entity.too.large') {
      res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'The JSON request is too large.' } })
      return
    }
    if (error.status >= 400 && error.status < 500) {
      res.status(error.status).json({ error: { code: 'INVALID_REQUEST', message: 'The request could not be read. Check the URL and JSON body.' } })
      return
    }
    console.error(new Date().toISOString(), req.method, 'UNHANDLED_REQUEST_ERROR')
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'SpartIN could not complete the request. Please try again.' } })
  }
  app.use(handleError)
  return app
}
