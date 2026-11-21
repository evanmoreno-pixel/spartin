import { mkdtempSync, rmSync } from 'node:fs'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { expect, test, type Page } from '@playwright/test'
import { createApp } from '../../dist/server/backend/src/app.js'
import { openDatabase } from '../../dist/server/backend/src/data/database.js'

let directory: string
let db: DatabaseSync
let server: Server
let url: string

test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'spartin-browser-'))
  db = openDatabase(join(directory, 'browser.sqlite'))
  const app = createApp(db, { clientDirectory: resolve('dist/client') })
  server = await new Promise<Server>((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener)).once('error', reject)
  })
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

test.afterAll(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  db?.close()
  if (directory) rmSync(directory, { recursive: true, force: true })
})

async function selectAccount(page: Page, name: string) {
  await page.goto(url)
  await expect(page.getByText('Simulated authentication')).toBeVisible()
  await page.getByRole('button', { name: new RegExp(name) }).click()
}

test('FR-02 and FR-03 flow through the browser, REST API and SQLite file', async ({ page, browser }) => {
  const participant = await browser.newPage({ viewport: { width: 390, height: 844 }, timezoneId: 'America/Los_Angeles' })
  const otherOrganizer = await browser.newPage()
  try {
    await selectAccount(page, 'Organizer 1')
    await selectAccount(participant, 'Participant 1')
    await selectAccount(otherOrganizer, 'Organizer 2')
    await expect(page.getByRole('heading', { name: 'Your campus events' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Library Study Jam' })).toHaveCount(0)
    await expect(participant.getByRole('heading', { name: 'Explore campus events' })).toBeVisible()
    expect(await participant.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    await expect(participant.getByRole('link', { name: 'Create event' })).toHaveCount(0)

    await page.getByRole('link', { name: 'Create event' }).click()
    await page.getByRole('button', { name: 'Create event' }).click()
    await expect(page.getByRole('alert')).toContainText('Check the highlighted fields')
    await page.getByLabel('Event title').fill('First-Gen Study Circle')
    await page.getByLabel('Description (optional)').fill('Bring your notes and meet study partners.')
    await page.getByLabel('Location').fill('Student Union, Room 4')
    await page.getByLabel('Participant capacity (optional)').fill('14')
    await page.getByLabel('Start date and time').fill('2099-04-12T14:00')
    await page.getByLabel('End date and time').fill('2099-04-12T15:00')
    await page.getByRole('button', { name: 'Create event' }).click()
    await expect(page.getByText('Event created.', { exact: true })).toBeVisible()
    const organizerUrl = page.url()
    const id = organizerUrl.split('/').at(-1)!
    expect(db.prepare('SELECT title, capacity FROM events WHERE event_id = ?').get(id))
      .toMatchObject({ title: 'First-Gen Study Circle', capacity: 14 })
    await otherOrganizer.goto(`${organizerUrl}/edit`)
    await expect(otherOrganizer.getByRole('heading', { name: 'Event unavailable' })).toBeVisible()

    await participant.getByRole('button', { name: 'Refresh' }).click()
    await participant.getByRole('link', { name: 'View details for First-Gen Study Circle' }).click()
    await expect(participant.getByRole('heading', { name: 'First-Gen Study Circle' })).toBeVisible()
    await expect(participant.getByText('Student Union, Room 4')).toBeVisible()
    await expect(participant.getByText('Bring your notes and meet study partners.')).toBeVisible()
    await expect(participant.getByText('Organizer 1', { exact: true })).toBeVisible()
    await expect(participant.getByText('14', { exact: true })).toBeVisible()
    const participantUrl = participant.url()

    await page.getByRole('link', { name: 'Edit or reschedule' }).click()
    await page.getByLabel('Location').fill('King Library, Room 210')
    await page.getByLabel('Start date and time').fill('2099-04-13T15:00')
    await page.getByLabel('End date and time').fill('2099-04-13T16:00')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Event rescheduled.', { exact: true })).toBeVisible()
    await participant.reload()
    await expect(participant.getByText('King Library, Room 210')).toBeVisible()
    await expect(participant.getByText(/04-13-2099 · 3:00 PM/)).toBeVisible()

    await page.getByRole('link', { name: 'Edit or reschedule' }).click()
    await page.getByLabel('Status').selectOption('postponed')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Event postponed.', { exact: true })).toBeVisible()
    await participant.reload()
    await expect(participant.getByRole('heading', { name: 'Event unavailable' })).toBeVisible()

    await page.getByRole('link', { name: 'Edit or reschedule' }).click()
    await page.getByLabel('Status').selectOption('scheduled')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByText('Event updated.', { exact: true })).toBeVisible()
    await participant.goto(participantUrl)
    await expect(participant.getByRole('heading', { name: 'First-Gen Study Circle' })).toBeVisible()
    // A visibility refresh updates an already-open detail page after the organizer deletes it.
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'First-Gen Study Circle' })).toBeVisible()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete event', exact: true }).click()
    await expect(page.getByText('Event deleted.', { exact: true })).toBeVisible()
    expect(db.prepare('SELECT event_id FROM events WHERE event_id = ?').get(id)).toBeUndefined()
    await participant.evaluate(() => window.dispatchEvent(new Event('focus')))
    await expect(participant.getByRole('heading', { name: 'Event unavailable' })).toBeVisible()
    await participant.getByRole('link', { name: 'Available events' }).click()
    await expect(participant.getByRole('heading', { name: 'Transfer Student Coffee Meetup' })).toBeVisible()
    await expect(participant.getByRole('heading', { name: 'First-Gen Study Circle' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Switch account' }).click()
    await expect(page.getByRole('heading', { name: 'Choose a demo account' })).toBeVisible()
  } finally {
    await participant.close()
    await otherOrganizer.close()
  }
})
