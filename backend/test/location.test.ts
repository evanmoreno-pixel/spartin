import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Express } from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDatabase } from '../src/data/database.js'

const event = {
  title: 'Off-campus study group', location: '150 E San Fernando St, San José, CA',
  startTime: '2099-06-01T16:00:00Z', endTime: '2099-06-01T18:00:00Z',
}

async function signIn(app: Express, accountKey: string) {
  const agent = request.agent(app)
  await agent.post('/api/session').send({ accountKey }).expect(200)
  return agent
}

describe('FR-04 optional event coordinates', () => {
  it.each([
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: -181 },
    { latitude: 0 },
    { latitude: '37.0', longitude: -121 },
    { latitude: 37, longitude: -121, accuracy: 5 },
    [37, -121],
  ].map(coordinates => ({ coordinates })))('rejects an invalid coordinate payload %#', async ({ coordinates }) => {
    const db = openDatabase(':memory:')
    try {
      const organizer = await signIn(createApp(db), 'organizer-1')
      const result = await organizer.post('/api/events').send({ ...event, coordinates }).expect(400)
      expect(result.body.error.fields.coordinates).toMatch(/both latitude/)
      expect(db.prepare('SELECT count(*) AS total FROM events').get()?.total).toBe(5)
    } finally {
      db.close()
    }
  })

  it('preserves the optional destination, applies ownership checks, and removes stale pins when relocating', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'spartin-location-'))
    const filename = join(directory, 'events.sqlite')
    let db = openDatabase(filename)
    try {
      const coordinates = { latitude: 37.33551, longitude: -121.88501 }
      const original = createApp(db)
      const organizer = await signIn(original, 'organizer-1')
      const created = await organizer.post('/api/events').send({ ...event, coordinates }).expect(201)
      const path = created.headers.location
      expect(created.body.data.coordinates).toEqual(coordinates)
      db.close()
      db = openDatabase(filename)
      const restarted = createApp(db)
      const participant = await signIn(restarted, 'participant-1')
      const otherOrganizer = await signIn(restarted, 'organizer-2')
      await participant.patch(path).send({ coordinates: null }).expect(403)
      await otherOrganizer.patch(path).send({ coordinates: null }).expect(403)
      expect((await participant.get(path).expect(200)).body.data.coordinates).toEqual(coordinates)
      expect((await participant.get('/api/events/transfer-coffee').expect(200)).body.data.coordinates).toBeNull()

      const owner = await signIn(restarted, 'organizer-1')
      expect((await owner.patch(path).send({ title: 'Quiet study session' }).expect(200)).body.data.coordinates).toEqual(coordinates)
      expect((await owner.patch(path).send({ location: '55 S 4th St, San José' }).expect(200)).body.data.coordinates).toBeNull()
      const newPoint = { latitude: 37.337, longitude: -121.88 }
      expect((await owner.patch(path).send({ location: 'Different address', coordinates: newPoint }).expect(200))
        .body.data.coordinates).toEqual(newPoint)
      expect((await owner.patch(path).send({ coordinates: null }).expect(200)).body.data.coordinates).toBeNull()
      expect(() => db.prepare('UPDATE events SET latitude = 37 WHERE event_id = ?').run(created.body.data.eventId)).toThrow(/constraint/i)
      expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([])
    } finally {
      if (db.isOpen) db.close()
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
