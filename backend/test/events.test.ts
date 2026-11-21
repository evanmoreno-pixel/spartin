import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Express } from 'express'
import type { DatabaseSync } from 'node:sqlite'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDatabase } from '../src/data/database.js'
import { sessionLifetimeMs } from '../src/services/demoSessions.js'

const validEvent = {
  title: 'Campus Garden Workday',
  description: 'Bring water and meet the campus garden volunteers.',
  location: 'Campus Community Garden',
  startTime: '2099-04-01T10:00:00-07:00',
  endTime: '2099-04-01T11:30:00-07:00',
  capacity: 12,
}

let db: DatabaseSync
let app: Express
let now: number

beforeEach(() => {
  db = openDatabase(':memory:')
  now = Date.now()
  app = createApp(db, { sessionClock: () => now })
})

afterEach(() => db.close())

async function login(accountKey: string, target = app) {
  const agent = request.agent(target)
  await agent.post('/api/session').send({ accountKey }).expect(200)
  return agent
}

describe('Demo sessions and protected endpoints (NFR-02, NFR-07)', () => {
  it('returns only the predefined accounts and uses a server-issued cookie', async () => {
    const accounts = await request(app).get('/api/demo-accounts').expect(200)
    expect(accounts.body.data.map((account: { displayName: string }) => account.displayName))
      .toEqual(['Organizer 1', 'Organizer 2', 'Participant 1'])
    expect(accounts.body.data[0]).not.toHaveProperty('userId')
    const agent = request.agent(app)
    const signedIn = await agent.post('/api/session').send({ accountKey: 'organizer-1' }).expect(200)
    expect(signedIn.headers['set-cookie'][0]).toMatch(/HttpOnly; SameSite=Strict/i)
    expect(signedIn.body.data).toMatchObject({ displayName: 'Organizer 1', role: 'organizer' })
    await agent.get('/api/session').expect(200)
    await agent.delete('/api/session').expect(204)
    await agent.get('/api/session').expect(401)
    await request(app).post('/api/events').set('Cookie', signedIn.headers['set-cookie'][0].split(';')[0])
      .send(validEvent).expect(401)
  })

  it.each([
    [{ accountKey: 'unknown' }],
    [{ userId: 'demo-organizer-1', role: 'organizer' }],
    [{ accountKey: 'participant-1', role: 'organizer' }],
    [[]],
  ])('rejects invalid demo sign-in input %j', async input => {
    await request(app).post('/api/session').send(input).expect(400)
  })

  it('rotates the cookie on account switch', async () => {
    const agent = request.agent(app)
    const organizer = await agent.post('/api/session').send({ accountKey: 'organizer-1' }).expect(200)
    await agent.post('/api/session').send({ accountKey: 'participant-1' }).expect(200)
    await agent.post('/api/events').send(validEvent).expect(403)
    await request(app).get('/api/session').set('Cookie', organizer.headers['set-cookie'][0].split(';')[0]).expect(401)
  })

  const protectedOperations = [
    ['get', '/api/organizer/events'],
    ['post', '/api/events'],
    ['patch', '/api/events/transfer-coffee'],
    ['delete', '/api/events/transfer-coffee'],
  ] as const

  it.each(protectedOperations)('rejects missing, forged and expired sessions, and participants for %s %s', async (method, route) => {
    await request(app)[method](route).expect(401)
    await request(app)[method](route)
      .set('Cookie', `spartin_demo_session=${'a'.repeat(43)}`)
      .set('X-Role', 'organizer').set('X-User-Id', 'demo-organizer-1').expect(401)

    const expired = await login('organizer-1')
    now += sessionLifetimeMs
    await expired[method](route).expect(401)
    const participant = await login('participant-1')
    await participant[method](route).expect(403)
    expect(db.prepare('SELECT count(*) AS total FROM events').get()?.total).toBe(5)
  })

  it('requires a session to browse or open event details', async () => {
    await request(app).get('/api/events').expect(401)
    await request(app).get('/api/events/transfer-coffee').expect(401)
  })
})

describe('Event management and browsing (FR-02, FR-03)', () => {
  it('shares persisted create, reschedule, postponement, restoration and deletion with participants', async () => {
    const organizer = await login('organizer-1')
    const otherOrganizer = await login('organizer-2')
    const participant = await login('participant-1')
    const seeded = await organizer.get('/api/organizer/events').expect(200)
    expect(seeded.body.data.map((event: { organizerId: string }) => event.organizerId))
      .toEqual(Array(3).fill('demo-organizer-1'))

    const create = await organizer.post('/api/events').send(validEvent).expect(201)
    const { eventId } = create.body.data
    const route = `/api/events/${eventId}`
    expect(create.headers.location).toBe(route)
    const detail = await participant.get(route).expect(200)
    expect(detail.body.data).toMatchObject({
      ...validEvent,
      organizerDisplayName: 'Organizer 1',
      startTime: '2099-04-01T17:00:00.000Z',
      endTime: '2099-04-01T18:30:00.000Z',
      status: 'scheduled',
    })
    await otherOrganizer.patch(route).send({ title: 'Unauthorized edit' }).expect(403)
    await otherOrganizer.delete(route).expect(403)

    const rescheduled = await organizer.patch(route)
      .send({ title: 'Garden Volunteer Day', startTime: '2099-04-02T17:00:00Z', endTime: '2099-04-02T19:00:00Z' }).expect(200)
    expect(rescheduled.body.data.location).toBe(validEvent.location)
    expect(rescheduled.body.data.title).toBe('Garden Volunteer Day')
    await organizer.patch(route).send({ status: 'postponed' }).expect(200)
    await participant.get(route).expect(404)
    const catalog = await participant.get('/api/events').expect(200)
    expect(catalog.body.data).not.toContainEqual(expect.objectContaining({ eventId }))
    const owned = await organizer.get('/api/organizer/events').expect(200)
    expect(owned.body.data).toContainEqual(expect.objectContaining({ eventId, status: 'postponed' }))
    await organizer.get(route).expect(200)

    await organizer.patch(route).send({ status: 'scheduled' }).expect(200)
    const restored = await participant.get('/api/events').expect(200)
    expect(restored.body.data).toContainEqual(expect.objectContaining({ eventId, title: 'Garden Volunteer Day' }))
    await organizer.delete(route).expect(204)
    await participant.get(route).expect(404)
    await organizer.patch(route).send({ title: 'Missing event' }).expect(404)
    await organizer.delete(route).expect(404)
    const remaining = await participant.get('/api/events').expect(200)
    expect(remaining.body.data).not.toContainEqual(expect.objectContaining({ eventId }))
  })

  it('hides ended events and supports bounded pages', async () => {
    const organizer = await login('organizer-2')
    const participant = await login('participant-1')
    const ended = await organizer.post('/api/events')
      .send({ ...validEvent, startTime: '2020-04-01T10:00:00Z', endTime: '2020-04-01T11:00:00Z' }).expect(201)
    await participant.get(ended.headers.location).expect(404)
    await organizer.get(ended.headers.location).expect(200)
    for (let i = 0; i < 21; i++) {
      await organizer.post('/api/events').send({ ...validEvent, title: `Garden meetup ${i + 1}` }).expect(201)
    }
    const first = await participant.get('/api/events').expect(200)
    const second = await participant.get('/api/events?page=2').expect(200)
    expect(first.body.data).toHaveLength(24)
    expect(first.body.pagination).toEqual({ page: 1, hasNext: true })
    expect(second.body.data).toHaveLength(2)
    expect(second.body.pagination).toEqual({ page: 2, hasNext: false })
    await participant.get('/api/events?page=0').expect(400)
    await organizer.get('/api/organizer/events?page=1.5').expect(400)
    await participant.get('/api/events/invalid%20id').expect(400)
  })
})

describe('Input validation and persistence (NFR-01)', () => {
  it.each([
    ['title', '  '],
    ['location', ''],
    ['description', null],
    ['startTime', '2099-02-29T10:00:00Z'],
    ['startTime', '2099-04-01T10:00:00'],
    ['endTime', validEvent.startTime],
    ['endTime', '2099-04-01T09:00:00-07:00'],
    ['capacity', -1],
    ['capacity', 1.5],
    ['capacity', '12'],
    ['capacity', Number.MAX_SAFE_INTEGER + 1],
    ['status', 'unknown'],
  ])('rejects an invalid %s value (%j)', async (field, value) => {
    const organizer = await login('organizer-1')
    const result = await organizer.post('/api/events').send({ ...validEvent, [field]: value }).expect(400)
    expect(result.body.error.fields).toHaveProperty(field)
    expect(db.prepare('SELECT count(*) AS total FROM events').get()?.total).toBe(5)
  })

  it('accepts nullable capacity, empty description and zero capacity, and rejects attempts to change ownership', async () => {
    const organizer = await login('organizer-1')
    const { description: _description, capacity: _capacity, ...required } = validEvent
    const result = await organizer.post('/api/events').send(required).expect(201)
    expect(result.body.data).toMatchObject({ description: '', capacity: null, status: 'scheduled' })
    await organizer.patch(result.headers.location).send({ organizerId: 'demo-organizer-2' }).expect(400)
    await organizer.patch(result.headers.location).send({}).expect(400)
    await organizer.patch(result.headers.location).set('Content-Type', 'application/json').send('{').expect(400)
    await organizer.patch(result.headers.location).send({ endTime: '2099-03-01T00:00:00Z', capacity: 20 }).expect(400)
    const zero = await organizer.patch(result.headers.location).send({ capacity: 0 }).expect(200)
    expect(zero.body.data).toMatchObject({ capacity: 0, organizerId: 'demo-organizer-1', endTime: '2099-04-01T18:30:00.000Z' })
  })

  it('preserves changes and deletions after closing and reopening a SQLite file', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'spartin-test-'))
    const filename = join(directory, 'events.sqlite')
    let fileDb = openDatabase(filename)
    try {
      const currentApp = createApp(fileDb)
      const organizer = await login('organizer-1', currentApp)
      const added = await organizer.post('/api/events').send(validEvent).expect(201)
      await organizer.patch(added.headers.location).send({ location: 'New Garden Entrance' }).expect(200)
      await organizer.delete('/api/events/transfer-coffee').expect(204)

      fileDb.close()
      fileDb = openDatabase(filename)
      const restarted = createApp(fileDb)
      const participant = await login('participant-1', restarted)
      const detail = await participant.get(added.headers.location).expect(200)
      expect(detail.body.data.location).toBe('New Garden Entrance')
      await participant.get('/api/events/transfer-coffee').expect(404)
      expect(fileDb.prepare('SELECT count(*) AS total FROM schema_migrations').get()?.total).toBe(2)
    } finally {
      if (fileDb.isOpen) fileDb.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
