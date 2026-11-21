import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import request from 'supertest'
import { createServer } from 'vite'
import { expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { openDatabase } from '../src/data/database.js'

it('SEC-01 accepts same-origin browser requests and rejects outside origins on protected writes', async () => {
  const db = openDatabase(':memory:')
  try {
    const app = createApp(db)
    const agent = request.agent(app)
    const origin = 'http://localhost:5173'
    await agent.post('/api/session')
      .set('Host', 'localhost:5173').set('Origin', origin).set('Sec-Fetch-Site', 'same-origin')
      .send({ accountKey: 'participant-1' }).expect(200)

    const result = await agent.post('/api/events/transfer-coffee/join')
      .set('Host', 'localhost:5173').set('Origin', 'http://localhost:4180').set('Sec-Fetch-Site', 'same-site')
      .expect(403)
    expect(result.body.error.code).toBe('ORIGIN_NOT_ALLOWED')
    expect(db.prepare('SELECT COUNT(*) AS total FROM participation').get()?.total).toBe(0)

    const accepted = await agent.post('/api/events/transfer-coffee/join')
      .set('Host', 'localhost:5173').set('Origin', origin).set('Sec-Fetch-Site', 'same-origin').expect(200)
    expect(accepted.body.data.outcome).toBe('JOINED')
  } finally { db.close() }
})

it('SEC-02 rejects browser writes marked cross-site even when Origin is absent', async () => {
  const db = openDatabase(':memory:')
  try {
    const agent = request.agent(createApp(db))
    await agent.post('/api/session').send({ accountKey: 'organizer-1' }).expect(200)
    await agent.delete('/api/session').set('Sec-Fetch-Site', 'cross-site').expect(403)
    await agent.get('/api/session').expect(200)
  } finally { db.close() }
})

it('SEC-03 applies JSON size and format limits without logging or exposing content', async () => {
  const db = openDatabase(':memory:')
  try {
    const agent = request.agent(createApp(db))
    await agent.post('/api/session').send({ accountKey: 'organizer-1' }).expect(200)
    const oversized = await agent.post('/api/events').send({ title: 'a'.repeat(50 * 1024) }).expect(413)
    expect(oversized.body).toEqual({ error: { code: 'BODY_TOO_LARGE', message: 'The JSON request is too large.' } })
    const invalid = await agent.post('/api/events').set('Content-Type', 'application/json').send('{"title":').expect(400)
    expect(invalid.body.error.code).toBe('INVALID_REQUEST')
    expect(db.prepare('SELECT COUNT(*) AS total FROM events').get()?.total).toBe(5)
  } finally { db.close() }
})

it('SEC-04 uses the session participant and serves protected data with no-store', async () => {
  const db = openDatabase(':memory:')
  try {
    const app = createApp(db)
    const first = request.agent(app)
    const second = request.agent(app)
    await first.post('/api/session').send({ accountKey: 'participant-1' }).expect(200)
    await second.post('/api/session').send({ accountKey: 'participant-2' }).expect(200)
    await first.post('/api/events/transfer-coffee/join').query({ userId: 'demo-participant-2' }).expect(200)
    const own = await first.get('/api/me/participation').expect('Cache-Control', 'no-store').expect(200)
    const other = await second.get('/api/me/participation').expect('X-Content-Type-Options', 'nosniff').expect(200)
    expect(own.body.data.map((event: { eventId: string }) => event.eventId)).toEqual(['transfer-coffee'])
    expect(other.body.data).toEqual([])
    expect(other.headers['access-control-allow-origin']).toBeUndefined()
  } finally { db.close() }
})

it('SEC-05 returns generic internal errors and logs no request path or driver detail', async () => {
  const db = openDatabase(':memory:')
  const agent = request.agent(createApp(db))
  await agent.post('/api/session').send({ accountKey: 'participant-1' }).expect(200)
  db.close()
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const result = await agent.get('/api/events').expect(500)
    expect(result.body).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'SpartIN could not complete the request. Please try again.' } })
    expect(log.mock.calls).toEqual([[expect.any(String), 'GET', 'UNHANDLED_REQUEST_ERROR']])
  } finally { log.mockRestore() }
})

it('SEC-06 preserves the browser origin through the real Vite development proxy', async () => {
  const db = openDatabase(':memory:')
  const api = createApp(db).listen(0, '127.0.0.1')
  await once(api, 'listening')
  vi.stubEnv('PORT', String((api.address() as AddressInfo).port))
  let web: Awaited<ReturnType<typeof createServer>> | undefined
  try {
    web = await createServer({ logLevel: 'silent', server: { port: 0, watch: null, ws: false } })
    await web.listen()
    const origin = `http://127.0.0.1:${(web.httpServer?.address() as AddressInfo).port}`
    const agent = request.agent(origin)
    const signedIn = await agent.post('/api/session')
      .set('Origin', origin).set('Sec-Fetch-Site', 'same-origin')
      .send({ accountKey: 'organizer-1' }).expect(200)
    expect(signedIn.body.data.role).toBe('organizer')
    await agent.delete('/api/session').set('Origin', origin).set('Sec-Fetch-Site', 'same-origin').expect(204)
    await agent.get('/api/session').expect(401)
  } finally {
    await web?.close()
    vi.unstubAllEnvs()
    await new Promise<void>(resolve => api.close(() => resolve()))
    db.close()
  }
})
