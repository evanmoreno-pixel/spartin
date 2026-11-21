import assert from 'node:assert/strict'
import { fork } from 'node:child_process'
import { once } from 'node:events'
import { mkdtempSync, realpathSync, rmSync } from 'node:fs'
import os from 'node:os'
import { basename, dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { setTimeout as pause } from 'node:timers/promises'
import { createApp } from '../dist/server/backend/src/app.js'
import { openDatabase, transaction } from '../dist/server/backend/src/data/database.js'

const people = (role, count) => Array.from({ length: count }, (_, index) => ({
  accountKey: `load-${role}-${index}`, userId: `load-${role}-${index}`,
  displayName: `Synthetic ${role} ${index + 1}`, role,
}))
const participants = people('participant', 100)
const organizers = people('organizer', 20)
const seedCount = 1000
const eventData = {
  title: 'Synthetic campus event', description: 'Isolated performance fixture', location: 'Student Union',
  startTime: '2099-06-01T17:00:00.000Z', endTime: '2099-06-01T18:00:00.000Z',
}
const seededId = index => `load-event-${index % seedCount}`
const eventPath = id => `/api/events/${id}`
const measure = () => ({ samples: [], failures: {}, operations: {}, expectedConflicts: 0 })

function seed(db) {
  transaction(db, () => {
    const addUser = db.prepare('INSERT INTO users (user_id, display_name, role) VALUES (?, ?, ?)')
    for (const { userId, displayName, role } of [...participants, ...organizers]) addUser.run(userId, displayName, role)
    const addEvent = db.prepare(`
      INSERT INTO events (event_id, organizer_id, title, description, location, start_time, end_time,
        capacity, waitlist_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    for (let index = 0; index < seedCount; index++) {
      addEvent.run(seededId(index), organizers[index % organizers.length].userId, `Campus meetup ${index + 1}`,
        eventData.description, eventData.location, eventData.startTime, eventData.endTime, null, 0, now, now)
    }
    for (const [id, waitlistEnabled] of [['load-open-queue', 1], ['load-closed-queue', 0]]) {
      addEvent.run(id, organizers[0].userId, id, eventData.description, eventData.location,
        eventData.startTime, eventData.endTime, 5, waitlistEnabled, now, now)
    }
  })
}

async function serverWorker(filename) {
  assert(process.connected)
  assert.equal(dirname(dirname(filename)), realpathSync(os.tmpdir()))
  assert.match(basename(dirname(filename)), /^spartin-load-[A-Za-z0-9]+$/)
  assert.equal(basename(filename), 'benchmark.sqlite')
  const db = openDatabase(filename)
  seed(db)
  const app = createApp(db, { demoDirectory: [...participants, ...organizers] })
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  let peakRss = process.memoryUsage.rss()
  const sampler = setInterval(() => { peakRss = Math.max(peakRss, process.memoryUsage.rss()) }, 250)
  sampler.unref()
  process.on('message', command => {
    if (command !== 'resources') return
    const rss = process.memoryUsage.rss()
    process.send({ cpu: process.cpuUsage(), rss, peakRss: Math.max(peakRss, rss) })
    peakRss = rss
  })
  process.once('disconnect', () => server.close(() => db.close()))
  process.send({ port: server.address().port, events: db.prepare('SELECT count(*) AS total FROM events').get().total })
}

function report({ samples, failures, operations, expectedConflicts }, start, finish, initial, final, virtualUsers) {
  const sorted = [...samples].sort((a, b) => a - b)
  const percent = index => sorted[Math.ceil(sorted.length * index) - 1]
  const failed = Object.values(failures).reduce((sum, value) => sum + value, 0)
  const seconds = (finish - start) / 1000
  const under2Seconds = sorted.filter(value => value <= 2000).length
  const cpuMicros = final.cpu.user + final.cpu.system - initial.cpu.user - initial.cpu.system
  return {
    virtualUsers, seconds, requests: sorted.length, successful: sorted.length - failed, failed,
    errorRate: failed / sorted.length * 100, expectedConflicts, failures, operations,
    medianMs: percent(.5), p90Ms: percent(.9), p95Ms: percent(.95), p99Ms: percent(.99), maxMs: sorted.at(-1),
    under2Seconds, percentWithin2Seconds: under2Seconds / sorted.length * 100,
    requestsPerSecond: sorted.length / seconds,
    backendCpuPercentOfOneCore: cpuMicros / (seconds * 1e6) * 100,
    backendPeakRssMiB: final.peakRss / 2 ** 20,
  }
}

async function run() {
  const directory = mkdtempSync(join(realpathSync(os.tmpdir()), 'spartin-load-'))
  const filename = join(directory, 'benchmark.sqlite')
  const child = fork(import.meta.filename, ['--worker', filename], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] })
  const exited = once(child, 'exit')
  let db
  try {
    async function message() {
      return Promise.race([
        once(child, 'message').then(([value]) => value),
        exited.then(([code]) => { throw new Error(`Benchmark server exited (${code})`) }),
      ])
    }
    const { port, events } = await message()
    assert.equal(events, 1007)
    const base = `http://127.0.0.1:${port}`

    async function request(method, path, cookie, expected = 200, body, metrics, operation) {
      const started = performance.now()
      let outcome
      let code = 'transport'
      try {
        const response = await fetch(base + path, {
          method, signal: AbortSignal.timeout(10_000), redirect: 'error',
          headers: { ...(cookie && { Cookie: cookie }), ...(body && { 'Content-Type': 'application/json' }) },
          ...(body && { body: JSON.stringify(body) }),
        })
        code = String(response.status)
        const value = response.status === 204 ? null : await response.json()
        outcome = { status: response.status, data: value?.data, code: value?.error?.code, cookie: response.headers.get('set-cookie') }
      } catch (error) {
        if (!metrics) throw error
      }
      const matches = Array.isArray(expected) ? expected.includes(outcome?.status) : expected === outcome?.status
      if (metrics) {
        metrics.samples.push(performance.now() - started)
        metrics.operations[operation] = (metrics.operations[operation] ?? 0) + 1
        if (!matches) metrics.failures[code] = (metrics.failures[code] ?? 0) + 1
        if (matches && outcome.status === 409) metrics.expectedConflicts++
      } else {
        assert(matches, `${method} ${path}: unexpected HTTP status ${code}`)
      }
      return outcome
    }

    async function signIn(account, index) {
      const result = await request('POST', '/api/session', undefined, 200, { accountKey: account.accountKey })
      assert.equal(result.data.userId, account.userId)
      return { index, userId: account.userId, cookie: result.cookie.split(';')[0] }
    }
    const peopleSessions = await Promise.all(participants.map(signIn))
    const hostSessions = await Promise.all(organizers.map(signIn))
    db = new DatabaseSync(filename, { readOnly: true })

    async function resources() {
      const reply = message()
      child.send('resources')
      return reply
    }

    function perform(session, metrics, order, loop) {
      const [name, method, path, expected, body] = order[loop % order.length]
      return request(method, path, session.cookie, expected, body, metrics, name)
    }

    const readFlow = id => [
      ['list', 'GET', '/api/events?page=3'], ['detail', 'GET', eventPath(id)],
      ['discovery', 'GET', '/api/events/discovery'], ['list', 'GET', '/api/events?page=19'],
      ['detail', 'GET', eventPath(id)],
    ]
    const participationFlow = (id, passId) => [
      ['join', 'POST', eventPath(id) + '/join'], ['status', 'GET', eventPath(id) + '/participation'],
      ['leave', 'POST', eventPath(id) + '/leave'], ['pass', 'POST', eventPath(passId) + '/pass'],
    ]
    const participantMixed = (id, passId) => [
      ...readFlow(id), ['list', 'GET', '/api/events?page=6'], ...participationFlow(id, passId),
    ]
    const outstanding = new Map()
    async function organizerStep(session, metrics, loop, mixed) {
      const activeId = outstanding.get(session) ?? seededId(session.index)
      const writes = [
        ['create', 'POST', '/api/events', 201, eventData],
        ['update', 'PATCH', eventPath(activeId), 200, { title: 'Updated synthetic event' }],
        ['detail', 'GET', eventPath(activeId)],
        ['delete', 'DELETE', eventPath(activeId), 204],
      ]
      const reads = [
        ['owned', 'GET', '/api/organizer/events?page=1'], ['detail', 'GET', eventPath(seededId(session.index + 20))],
        ['detail', 'GET', eventPath(seededId(session.index + 40))], ['owned', 'GET', '/api/organizer/events?page=2'],
        ['detail', 'GET', eventPath(seededId(session.index + 60))], ['owned', 'GET', '/api/organizer/events?page=1'],
      ]
      const pattern = mixed ? [...reads, ...writes] : writes
      const name = pattern[loop % pattern.length][0]
      if ((name === 'delete' || name === 'update') && !outstanding.has(session)) return
      const response = await perform(session, metrics, pattern, loop)
      if (name === 'create' && response?.status === 201) outstanding.set(session, response.data.eventId)
      if (name === 'delete' && response?.status === 204) outstanding.delete(session)
    }

    async function windowed(sessions, seconds, action) {
      const metrics = measure()
      const initial = await resources()
      const started = performance.now()
      await Promise.all(sessions.map(async (session, index) => {
        await pause((index * 17) % 181)
        let loop = 0
        while (performance.now() < started + seconds * 1000) {
          await action(session, metrics, loop)
          loop++
          await pause(160 + (index * 7 + loop * 13) % 201)
        }
      }))
      const finish = performance.now()
      const final = await resources()
      for (const [session, id] of outstanding) await request('DELETE', eventPath(id), session.cookie, 204)
      outstanding.clear()
      return report(metrics, started, finish, initial, final, sessions.length)
    }

    const runParticipants = flow => (session, metrics, loop) => {
      const length = flow(seededId(0), seededId(1)).length
      const round = Math.floor(loop / length)
      const index = (session.index * 13 + round * 3) % seedCount
      return perform(session, metrics, flow(seededId(index), seededId(index + 1)), loop)
    }
    const browsing = await windowed(peopleSessions, 6, runParticipants(readFlow))
    const participation = await windowed(peopleSessions, 6, runParticipants(participationFlow))
    const organizer = await windowed(hostSessions, 6, (s, m, i) => organizerStep(s, m, i, false))
    const mixedUsers = [...peopleSessions.slice(0, 80), ...hostSessions]
    const main = await windowed(mixedUsers, 24, (s, m, i) => s.userId.startsWith('load-organizer')
      ? organizerStep(s, m, i, true) : runParticipants(participantMixed)(s, m, i))

    const contentionMetrics = measure()
    const initial = await resources()
    const started = performance.now()
    const act = (session, id, action, status = 200) =>
      request('POST', eventPath(id) + '/' + action, session.cookie, status, undefined, contentionMetrics, action)
    const [closed, queued] = ['load-closed-queue', 'load-open-queue']
    const closedResults = await Promise.all(peopleSessions.map(session => act(session, closed, 'join', [200, 409])))
    assert.equal(closedResults.filter(result => result.data?.outcome === 'JOINED').length, 5)
    assert.equal(closedResults.filter(result => result.code === 'FULL').length, 95)
    const queueResults = await Promise.all(peopleSessions.map(session => act(session, queued, 'join')))
    assert.equal(queueResults.filter(result => result.data?.outcome === 'JOINED').length, 5)
    assert.deepEqual(queueResults.filter(result => result.data?.outcome === 'WAITLISTED')
      .map(result => result.data.waitlistPosition).sort((a, b) => a - b), Array.from({ length: 95 }, (_, index) => index + 1))
    const firstWaiting = db.prepare("SELECT user_id FROM participation WHERE event_id = ? AND status = 'waitlisted' ORDER BY waitlist_order LIMIT 1").get(queued).user_id
    const firstWaiter = peopleSessions.find(session => session.userId === firstWaiting)
    const joinRetries = await Promise.all(Array.from({ length: 5 }, () => act(firstWaiter, queued, 'join')))
    assert(joinRetries.every(result => result.data.outcome === 'WAITLISTED' && result.data.waitlistPosition === 1))
    const leaving = db.prepare("SELECT user_id FROM participation WHERE event_id = ? AND status = 'joined' ORDER BY user_id LIMIT 1").get(queued).user_id
    const leavingSession = peopleSessions.find(session => session.userId === leaving)
    const leaveRetries = await Promise.all(Array.from({ length: 5 }, () => act(leavingSession, queued, 'leave')))
    assert(leaveRetries.every(result => result.data.outcome === 'LEFT'))
    const contention = report(contentionMetrics, started, performance.now(), initial, await resources(), 100)

    assert.equal(db.prepare('SELECT status FROM participation WHERE event_id = ? AND user_id = ?').get(queued, firstWaiting).status, 'joined')
    const openCounts = db.prepare('SELECT status, count(*) AS total FROM participation WHERE event_id = ? GROUP BY status ORDER BY status').all(queued)
    assert.deepEqual(openCounts.map(row => [row.status, row.total]), [['joined', 5], ['left', 1], ['waitlisted', 94]])
    const remaining = db.prepare("SELECT user_id FROM participation WHERE event_id = ? AND status = 'waitlisted' ORDER BY waitlist_order LIMIT 1").get(queued).user_id
    const remainingSession = peopleSessions.find(session => session.userId === remaining)
    const status = await request('GET', eventPath(queued) + '/participation', remainingSession.cookie)
    assert.equal(status.data.waitlistPosition, 1)
    assert.equal(db.prepare("SELECT count(*) AS total FROM participation WHERE event_id = ? AND status = 'joined'").get(closed).total, 5)
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), [])
    assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok')
    assert.equal(db.prepare(`
      SELECT count(*) AS total FROM events e WHERE e.capacity IS NOT NULL
      AND (SELECT count(*) FROM participation p WHERE p.event_id = e.event_id AND p.status = 'joined') > e.capacity
    `).get().total, 0)
    const finalEventCount = db.prepare('SELECT count(*) AS total FROM events').get().total
    assert.equal(finalEventCount, events)
    const pass = main.virtualUsers === 100 && events >= 1000 && main.percentWithin2Seconds >= 95
      && [browsing, participation, organizer, main, contention].every(stage => stage.failed === 0)
    console.log(JSON.stringify({
      environment: { node: process.version, sqlite: process.versions.sqlite, os: os.version(), cpu: os.cpus()[0]?.model, logicalCpus: os.availableParallelism(), memoryMiB: Math.round(os.totalmem() / 2 ** 20) },
      eventCount: events, finalEventCount, participantSessions: peopleSessions.length, organizerSessions: hostSessions.length,
      browsing, participation, organizer, main, contention,
      integrity: { closedJoined: 5, closedFull: 95, openJoined: 5, openWaitingAfterLeave: 94, repeatedJoins: 5, repeatedLeaves: 5, foreignKeys: 'ok', capacity: 'ok', fifo: 'ok' },
      nfr05: pass ? 'PASS' : 'FAIL',
    }, null, 2))
    if (!pass) process.exitCode = 1
  } finally {
    db?.close()
    if (child.connected) child.disconnect()
    await exited
    rmSync(directory, { recursive: true, force: true })
  }
}

if (process.argv[2] === '--worker') await serverWorker(process.argv[3])
else await run()
