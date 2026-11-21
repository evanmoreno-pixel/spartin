import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDatabase, transaction } from '../src/data/database.js'

it('DB-01 applies migration 4 to a version-3 fixture with a live FIFO queue and remains idempotent', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'spartin-release-migration-'))
  const filename = join(directory, 'legacy.sqlite')
  let db = openDatabase(filename)
  try {
    const app = createApp(db)
    db.prepare('UPDATE events SET capacity = 1, waitlist_enabled = 1 WHERE event_id = ?').run('transfer-coffee')
    for (const accountKey of ['participant-1', 'participant-2', 'participant-3']) {
      const agent = request.agent(app)
      await agent.post('/api/session').send({ accountKey }).expect(200)
      await agent.post('/api/events/transfer-coffee/join').expect(200)
    }
    // Reconstruct the version-3 table shape inside the disposable fixture.
    db.exec('ALTER TABLE events DROP COLUMN longitude; ALTER TABLE events DROP COLUMN latitude; DELETE FROM schema_migrations WHERE version = 4')
    const snapshot = () => ({
      users: db.prepare('SELECT * FROM users ORDER BY user_id').all(),
      events: db.prepare('SELECT * FROM events ORDER BY event_id').all(),
      participation: db.prepare('SELECT * FROM participation ORDER BY participation_id').all(),
      queue: db.prepare('SELECT * FROM waitlist_sequence').all(),
    })
    const previous = snapshot()
    expect(previous.participation.map(row => row.status).sort()).toEqual(['joined', 'waitlisted', 'waitlisted'])
    db.close()
    db = openDatabase(filename)
    const expected = { ...previous, events: previous.events.map(row => ({ ...row, latitude: null, longitude: null })) }
    expect(snapshot()).toEqual(expected)
    expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([])
    expect(db.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok')
    db.close()
    db = openDatabase(filename)
    expect(snapshot()).toEqual(expected)
    expect(db.prepare('SELECT version FROM schema_migrations ORDER BY version').all().map(row => row.version)).toEqual([1, 3, 4])
  } finally {
    if (db.isOpen) db.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

it('DB-02 rolls back related event and queue changes on failure and enforces uniqueness and foreign keys', async () => {
  const db = openDatabase(':memory:')
  try {
    expect(() => transaction(db, () => {
      db.prepare('UPDATE events SET capacity = 12 WHERE event_id = ?').run('transfer-coffee')
      db.prepare('UPDATE waitlist_sequence SET last_order = 1 WHERE id = 1').run()
      throw new Error('Simulated write interruption')
    })).toThrow('Simulated write interruption')
    expect(db.prepare('SELECT capacity FROM events WHERE event_id = ?').get('transfer-coffee')?.capacity).toBe(24)
    expect(db.prepare('SELECT last_order FROM waitlist_sequence').get()?.last_order).toBe(0)
    const add = db.prepare(`
      INSERT INTO participation (participation_id, user_id, event_id, status, created_at, updated_at)
      VALUES (?, ?, ?, 'joined', '2026-11-21T12:00:00Z', '2026-11-21T12:00:00Z')
    `)
    add.run('unique-a', 'demo-participant-1', 'transfer-coffee')
    expect(() => add.run('unique-b', 'demo-participant-1', 'transfer-coffee')).toThrow(/unique/i)
    expect(() => add.run('unique-c', 'demo-participant-1', 'missing')).toThrow(/foreign key/i)
    expect(db.prepare('PRAGMA busy_timeout').get()?.timeout).toBe(5000)
  } finally { db.close() }
})
