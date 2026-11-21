import { fork, type ChildProcess } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { Express } from 'express'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDatabase } from '../src/data/database.js'

const futureEvent = {
  title: 'Transfer Volunteer Meetup', location: 'Student Union',
  startTime: '2099-06-01T16:00:00Z', endTime: '2099-06-01T18:00:00Z',
}

let db: DatabaseSync
let app: Express

beforeEach(() => {
  db = openDatabase(':memory:')
  app = createApp(db)
})
afterEach(() => db.close())

async function signIn(accountKey: string, server: Express | string = app) {
  const agent = request.agent(server)
  await agent.post('/api/session').send({ accountKey }).expect(200)
  return agent
}

async function arrangeEvent(capacity: number | null, waitlistEnabled = false) {
  const owner = await signIn('organizer-1')
  const created = await owner.post('/api/events').send({ ...futureEvent, capacity, waitlistEnabled }).expect(201)
  return { owner, path: created.headers.location, eventId: created.body.data.eventId }
}

function startChild(filename: string, children: ChildProcess[]) {
  const child = fork(new URL('./fixtures/participationServer.ts', import.meta.url), [filename], {
    execArgv: ['--import', 'tsx'],
    stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
  })
  children.push(child)
  return new Promise<string>((resolve, reject) => {
    child.once('message', url => typeof url === 'string' ? resolve(url) : reject(new Error('Unexpected server address')))
    child.once('error', reject)
    child.once('exit', code => reject(new Error(`SQLite test server exited (${code})`)))
  })
}

async function stopChild(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return
  await new Promise<void>(resolve => {
    child.once('exit', () => resolve())
    if (child.connected) child.disconnect()
    else child.kill()
  })
}

it('migrates an existing Phase 1 SQLite file without changing its users or restoring deleted seed events', () => {
  const directory = mkdtempSync(join(tmpdir(), 'spartin-migration-'))
  const filename = join(directory, 'legacy.sqlite')
  let legacy = new DatabaseSync(filename)
  try {
    legacy.exec(`
      CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY);
      INSERT INTO schema_migrations VALUES (1), (2);
      CREATE TABLE users (
        user_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('organizer', 'participant'))
      ) STRICT;
      CREATE TABLE events (
        event_id TEXT PRIMARY KEY,
        organizer_id TEXT NOT NULL REFERENCES users (user_id),
        title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 150),
        description TEXT NOT NULL DEFAULT '',
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL CHECK (end_time > start_time),
        location TEXT NOT NULL CHECK (length(trim(location)) BETWEEN 1 AND 255),
        capacity INTEGER CHECK (capacity >= 0),
        status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'postponed')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      INSERT INTO users VALUES ('demo-organizer-1', 'Existing Organizer', 'organizer');
      INSERT INTO events VALUES (
        'legacy-event', 'demo-organizer-1', 'Saved event', 'Existing description',
        '2099-07-01T12:00:00.000Z', '2099-07-01T13:00:00.000Z', 'Student Union',
        20, 'postponed', '2026-11-20T19:00:00.000Z', '2026-11-21T19:00:00.000Z'
      );
    `)
    const original = legacy.prepare('SELECT * FROM events').get()
    legacy.close()
    legacy = openDatabase(filename)
    expect(legacy.prepare('SELECT * FROM events').all()).toEqual([{ ...original, waitlist_enabled: 0, latitude: null, longitude: null }])
    expect(legacy.prepare('SELECT display_name FROM users WHERE user_id = ?').get('demo-organizer-1'))
      .toEqual({ display_name: 'Existing Organizer' })
    expect(legacy.prepare('SELECT version FROM schema_migrations ORDER BY version').all())
      .toEqual([{ version: 1 }, { version: 2 }, { version: 3 }, { version: 4 }])
    expect(legacy.prepare('PRAGMA foreign_key_check').all()).toEqual([])
    expect(legacy.prepare('SELECT count(*) AS total FROM participation').get()?.total).toBe(0)
    legacy.close()
    legacy = openDatabase(filename)
    expect(legacy.prepare('SELECT count(*) AS total FROM events').get()?.total).toBe(1)
    expect(legacy.prepare('SELECT count(*) AS total FROM users').get()?.total).toBe(3)
  } finally {
    if (legacy.isOpen) legacy.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('FR-01 / FR-03 participation', () => {
  it('stores a pass, hides it from discovery, and supports explicit joining from details', async () => {
    const participant = await signIn('participant-1')
    const { eventId, path } = await arrangeEvent(1)
    const discovery = await participant.get('/api/events/discovery').expect(200)
    expect(discovery.body.data).toContainEqual(expect.objectContaining({ eventId }))
    for (let i = 0; i < 2; i++) {
      const pass = await participant.post(`${path}/pass`).expect(200)
      expect(pass.body.data).toEqual({ outcome: 'PASSED', status: 'passed', waitlistPosition: null })
    }
    const remaining = await participant.get('/api/events/discovery').expect(200)
    expect(remaining.body.data).not.toContainEqual(expect.objectContaining({ eventId }))
    const details = await participant.get(path).expect(200)
    expect(details.body.data).toMatchObject({ joinedCount: 0, participation: { status: 'passed' } })
    await participant.post(`${path}/leave`).expect(409)
    const joined = await participant.post(`${path}/join`).expect(200)
    expect(joined.body.data.outcome).toBe('JOINED')
    const retry = await participant.post(`${path}/join`).expect(200)
    expect(retry.body.data.outcome).toBe('ALREADY_JOINED')
    const conflict = await participant.post(`${path}/pass`).expect(409)
    expect(conflict.body.error.code).toBe('LEAVE_REQUIRED')
    expect(db.prepare('SELECT status FROM participation WHERE event_id = ?').all(eventId)).toEqual([{ status: 'joined' }])
    const left = await participant.post(`${path}/leave`).expect(200)
    expect(left.body.data.outcome).toBe('LEFT')
    const returned = await participant.get('/api/events/discovery').expect(200)
    expect(returned.body.data).toContainEqual(expect.objectContaining({ eventId, participation: { status: 'left', waitlistPosition: null } }))
  })

  it('rejects unauthorized and wrong-role calls to every participation endpoint', async () => {
    const organizer = await signIn('organizer-1')
    for (const action of ['join', 'pass', 'leave']) {
      const route = `/api/events/transfer-coffee/${action}`
      await request(app).post(route).expect(401)
      await organizer.post(route).expect(403)
    }
    for (const route of ['/api/events/discovery', '/api/me/participation', '/api/events/transfer-coffee/participation']) {
      await request(app).get(route).expect(401)
      await organizer.get(route).expect(403)
    }
    const participant = await signIn('participant-1')
    await participant.post('/api/events/unknown/join').expect(404)
    await participant.get('/api/events/unknown/participation').expect(404)
    await participant.post('/api/events/invalid%20id/pass').expect(400)
  })

  it('rejects new joins or passes on ended and postponed events and lets registered participants leave', async () => {
    const participant = await signIn('participant-1')
    const { owner, path } = await arrangeEvent(1)
    await participant.post(`${path}/join`).expect(200)
    const other = await signIn('participant-2')
    await owner.patch(path).send({ status: 'postponed' }).expect(200)
    const postponed = await other.post(`${path}/join`).expect(409)
    expect(postponed.body.error.code).toBe('EVENT_UNAVAILABLE')
    await other.post(`${path}/pass`).expect(409)
    await participant.post(`${path}/leave`).expect(200)
    await owner.patch(path).send({
      status: 'scheduled', startTime: '2020-04-01T08:00:00Z', endTime: '2020-04-01T10:00:00Z',
    }).expect(200)
    const ended = await other.post(`${path}/join`).expect(409)
    expect(ended.body.error.code).toBe('EVENT_UNAVAILABLE')
    await other.post(`${path}/pass`).expect(409)
  })

  it('preserves current participation across reopening and removes only event-related rows on organizer deletion', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'spartin-participation-'))
    const filename = join(directory, 'events.sqlite')
    let fileDb = openDatabase(filename)
    try {
      const participant = await signIn('participant-1', createApp(fileDb))
      await participant.post('/api/events/transfer-coffee/join').expect(200)
      await participant.post('/api/events/library-study/pass').expect(200)
      fileDb.close()
      fileDb = openDatabase(filename)
      const restarted = createApp(fileDb)
      const returning = await signIn('participant-1', restarted)
      const status = await returning.get('/api/events/transfer-coffee/participation').expect(200)
      expect(status.body.data).toEqual({ status: 'joined', waitlistPosition: null })
      const mine = await returning.get('/api/me/participation').expect(200)
      expect(mine.body.data.map((event: { eventId: string }) => event.eventId)).toEqual(['transfer-coffee'])
      const owner = await signIn('organizer-1', restarted)
      await owner.delete('/api/events/transfer-coffee').expect(204)
      expect(fileDb.prepare('SELECT status, event_id FROM participation').all()).toEqual([{ status: 'passed', event_id: 'library-study' }])
      expect(fileDb.prepare('SELECT count(*) AS total FROM users').get()?.total).toBe(5)
    } finally {
      if (fileDb.isOpen) fileDb.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})

describe('FR-07 capacity and FIFO waitlisting', () => {
  it('honors zero capacity with enrollment closed, enables queueing at zero, and promotes all when unlimited', async () => {
    const { owner, path } = await arrangeEvent(0)
    const first = await signIn('participant-1')
    const second = await signIn('participant-2')
    const full = await first.post(`${path}/join`).expect(409)
    expect(full.body.error.code).toBe('FULL')
    expect(db.prepare('SELECT count(*) AS total FROM participation').get()?.total).toBe(0)
    await owner.patch(path).send({ waitlistEnabled: 'yes' }).expect(400)
    await owner.patch(path).send({ waitlistEnabled: true }).expect(200)
    const queued = await first.post(`${path}/join`).expect(200)
    expect(queued.body.data).toEqual({ outcome: 'WAITLISTED', status: 'waitlisted', waitlistPosition: 1 })
    await second.post(`${path}/join`).expect(200)
    const unlimited = await owner.patch(path).send({ capacity: null }).expect(200)
    expect(unlimited.body.data).toMatchObject({ capacity: null, joinedCount: 2, waitlistedCount: 0 })
  })

  it('does not add a participation row when a positive-capacity event is full and enrollment is off', async () => {
    const { path } = await arrangeEvent(1)
    const first = await signIn('participant-1')
    const last = await signIn('participant-2')
    await first.post(`${path}/join`).expect(200)
    const full = await last.post(`${path}/join`).expect(409)
    expect(full.body.error.code).toBe('FULL')
    const absent = await last.get(`${path}/participation`).expect(200)
    expect(absent.body.data).toEqual({ status: null, waitlistPosition: null })
  })

  it('promotes the earliest waiter, recomputes positions and keeps retries idempotent', async () => {
    const { owner, path, eventId } = await arrangeEvent(1, true)
    const attendee = await signIn('participant-1')
    const first = await signIn('participant-3')
    const second = await signIn('participant-2')
    await attendee.post(`${path}/join`).expect(200)
    for (const [agent, position] of [[first, 1], [second, 2], [first, 1]] as const) {
      const queued = await agent.post(`${path}/join`).expect(200)
      expect(queued.body.data).toEqual({ outcome: 'WAITLISTED', status: 'waitlisted', waitlistPosition: position })
    }
    await first.post(`${path}/pass`).expect(409)
    for (let i = 0; i < 2; i++) await attendee.post(`${path}/leave`).expect(200)
    const promoted = await first.get(`${path}/participation`).expect(200)
    expect(promoted.body.data).toEqual({ status: 'joined', waitlistPosition: null })
    const remaining = await second.get(`${path}/participation`).expect(200)
    expect(remaining.body.data).toEqual({ status: 'waitlisted', waitlistPosition: 1 })
    await second.post(`${path}/leave`).expect(200)
    const counts = await owner.get(path).expect(200)
    expect(counts.body.data).toMatchObject({ joinedCount: 1, waitlistedCount: 0 })
    expect(db.prepare('SELECT count(*) AS total FROM participation WHERE event_id = ?').get(eventId)?.total).toBe(3)
  })

  it('moves a returning waiter to the end and honors existing positions after enrollment is closed', async () => {
    const { owner, path } = await arrangeEvent(0, true)
    const first = await signIn('participant-1')
    const second = await signIn('participant-2')
    const third = await signIn('participant-3')
    await first.post(`${path}/join`).expect(200)
    await second.post(`${path}/join`).expect(200)
    await first.post(`${path}/leave`).expect(200)
    const advanced = await second.get(`${path}/participation`).expect(200)
    expect(advanced.body.data.waitlistPosition).toBe(1)
    const returned = await first.post(`${path}/join`).expect(200)
    expect(returned.body.data.waitlistPosition).toBe(2)
    await owner.patch(path).send({ waitlistEnabled: false }).expect(200)
    await third.post(`${path}/join`).expect(409)
    const increase = await owner.patch(path).send({ capacity: 1 }).expect(200)
    expect(increase.body.data).toMatchObject({ joinedCount: 1, waitlistedCount: 1, waitlistEnabled: false })
    const promoted = await second.get(`${path}/participation`).expect(200)
    expect(promoted.body.data.status).toBe('joined')
    expect((await first.get(`${path}/participation`).expect(200)).body.data.waitlistPosition).toBe(1)
  })

  it('rejects a capacity decrease below attendance and resumes promotions only when rescheduled', async () => {
    const { owner, path } = await arrangeEvent(1, true)
    const otherOwner = await signIn('organizer-2')
    const attendee = await signIn('participant-1')
    const first = await signIn('participant-2')
    const second = await signIn('participant-3')
    await attendee.post(`${path}/join`).expect(200)
    await first.post(`${path}/join`).expect(200)
    await second.post(`${path}/join`).expect(200)
    await otherOwner.patch(path).send({ capacity: 3 }).expect(403)
    const reduced = await owner.patch(path).send({ capacity: 0 }).expect(409)
    expect(reduced.body.error.code).toBe('CAPACITY_BELOW_JOINED')
    const postponed = await owner.patch(path).send({ status: 'postponed', capacity: 2 }).expect(200)
    expect(postponed.body.data).toMatchObject({ joinedCount: 1, waitlistedCount: 2, capacity: 2 })
    const restored = await owner.patch(path).send({ status: 'scheduled' }).expect(200)
    expect(restored.body.data).toMatchObject({ joinedCount: 2, waitlistedCount: 1 })
    expect((await first.get(`${path}/participation`).expect(200)).body.data.status).toBe('joined')
    expect((await second.get(`${path}/participation`).expect(200)).body.data.waitlistPosition).toBe(1)
  })

  it.each([false, true])('does not overbook the final spot across two server processes (waitlist = %s)', async waitlistEnabled => {
    const directory = mkdtempSync(join(tmpdir(), 'spartin-race-'))
    const filename = join(directory, 'race.sqlite')
    const children: ChildProcess[] = []
    let fileDb: DatabaseSync | undefined
    try {
      const urls = await Promise.all([startChild(filename, children), startChild(filename, children)])
      const [owner, first, second] = await Promise.all([
        signIn('organizer-1', urls[0]), signIn('participant-1', urls[0]), signIn('participant-2', urls[1]),
      ])
      const created = await owner.post('/api/events').send({ ...futureEvent, capacity: 1, waitlistEnabled }).expect(201)
      const path = created.headers.location
      const responses = await Promise.all([first.post(`${path}/join`), second.post(`${path}/join`)])
      expect(responses.map(response => response.body.data?.outcome ?? response.body.error.code).sort())
        .toEqual(waitlistEnabled ? ['JOINED', 'WAITLISTED'] : ['FULL', 'JOINED'])
      expect(responses.map(response => response.status).sort()).toEqual(waitlistEnabled ? [200, 200] : [200, 409])
      fileDb = new DatabaseSync(filename, { readOnly: true })
      expect(fileDb.prepare('SELECT status FROM participation ORDER BY status').all())
        .toEqual(waitlistEnabled ? [{ status: 'joined' }, { status: 'waitlisted' }] : [{ status: 'joined' }])
    } finally {
      fileDb?.close()
      await Promise.all(children.map(stopChild))
      rmSync(directory, { recursive: true, force: true })
    }
  }, 15_000)
})
