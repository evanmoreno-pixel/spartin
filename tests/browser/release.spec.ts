import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import ICAL from 'ical.js'
import { selectDemoAccount, startBrowserApp, stubStreetTiles } from './localApp'

let app: Awaited<ReturnType<typeof startBrowserApp>>
test.beforeEach(async () => { app = await startBrowserApp() })
test.afterEach(async () => { await app?.stop() })

async function signIn(page: Page, account: string, path = '/') {
  await stubStreetTiles(page)
  await page.goto(app.url + path)
  await selectDemoAccount(page, account)
}

test('SYS-01 to SYS-04 completes organizer, participant, waitlist and cleanup workflows', async ({ page, browser, browserName }) => {
  test.setTimeout(60_000)
  const first = await browser.newPage({ viewport: { width: 390, height: 844 }, timezoneId: 'America/Los_Angeles' })
  const second = await browser.newPage({ viewport: { width: 768, height: 1024 } })
  const third = await browser.newPage()
  const title = 'SpartIN Release Study Group'
  let id = ''
  const roster = () => app.db.prepare('SELECT status, count(*) AS total FROM participation WHERE event_id = ? GROUP BY status ORDER BY status')
    .all(id).map(row => [row.status, row.total])
  const edit = async () => {
    await page.getByRole('link', { name: 'Edit or reschedule' }).click()
    await expect(page.getByRole('heading', { name: 'Edit event' })).toBeVisible()
  }
  const save = () => page.getByRole('button', { name: 'Save changes' }).click()
  const myEvents = async (participant: Page) => {
    await participant.getByRole('link', { name: 'Back to Available events' }).click()
    await participant.getByRole('link', { name: 'My events', exact: true }).click()
    return participant.getByRole('listitem').filter({ hasText: title })
  }

  try {
    await test.step('SYS-01 Organizer publishes a one-seat event, edits it, and verifies persistence on reload', async () => {
      await signIn(page, 'Organizer 1')
      await page.getByRole('link', { name: 'Create event' }).click()
      await page.getByLabel('Event title').fill('Draft Release Study Group')
      await page.getByLabel('Location', { exact: true }).fill('Student Union, Room 1200')
      await page.getByLabel('Start date and time').fill('2099-05-20T14:00')
      await page.getByLabel('End date and time').fill('2099-05-20T15:00')
      await page.getByLabel('Participant capacity (optional)').fill('1')
      await page.getByLabel('Allow waitlist enrollment when full').check()
      await page.getByRole('button', { name: 'Create event', exact: true }).click()
      await expect(page.getByText('Event created.', { exact: true })).toBeVisible()
      id = new URL(page.url()).pathname.split('/').at(-1)!
      await edit()
      await page.getByLabel('Event title').fill(title)
      await page.getByLabel('Description (optional)').fill('Bring a draft, your questions; and a laptop.')
      await save()
      await expect(page.getByText('Event updated.', { exact: true })).toBeVisible()
      await page.reload()
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
      expect(app.db.prepare('SELECT title, capacity, waitlist_enabled FROM events WHERE event_id = ?').get(id))
        .toMatchObject({ title, capacity: 1, waitlist_enabled: 1 })
    })

    await test.step('SYS-02 Participant finds the event, checks location, link and calendar, then joins', async () => {
      if (browserName === 'chromium') {
        await first.context().grantPermissions(['clipboard-read', 'clipboard-write'])
      } else {
        await first.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: () => Promise.reject(new DOMException('Denied in fixture', 'NotAllowedError')) },
          configurable: true,
        }))
      }
      await signIn(first, 'Participant 1')
      await first.getByRole('link', { name: 'Browse all' }).click()
      await first.getByRole('link', { name: `View details for ${title}` }).click()
      await expect(first.getByRole('region', { name: 'Event location map' })).toBeVisible()
      const directions = new URL((await first.getByRole('link', { name: 'Directions' }).getAttribute('href'))!)
      expect(directions.searchParams.get('destination')).toContain('Diaz Compean Student Union')
      expect(directions.searchParams.has('origin')).toBe(false)
      await first.getByRole('button', { name: 'Copy link' }).click()
      const sharedUrl = `${app.url}/events/${id}`
      if (browserName === 'chromium') {
        await expect(first.getByText('Event link copied.')).toBeVisible()
        expect(await first.evaluate(() => navigator.clipboard.readText())).toBe(sharedUrl)
      } else {
        await expect(first.getByLabel('Event link')).toHaveValue(sharedUrl)
      }
      const [download] = await Promise.all([
        first.waitForEvent('download'), first.getByRole('button', { name: 'Download calendar file' }).click(),
      ])
      const calendar = new ICAL.Component(ICAL.parse(readFileSync(await download.path(), 'utf8')))
      const item = new ICAL.Event(calendar.getFirstSubcomponent('vevent')!)
      expect(item.summary).toBe(title)
      expect(item.location).toBe('Student Union, Room 1200')
      expect(roster()).toEqual([])
      await first.getByRole('button', { name: 'Join', exact: true }).click()
      await expect(first.getByText('You joined the event.')).toBeVisible()
      await expect(await myEvents(first)).toContainText('Joined')
    })

    await test.step('SYS-03 Two participants queue and the first waiter is promoted when the seat is released', async () => {
      await signIn(second, 'Participant 2', `/events/${id}`)
      await second.getByRole('button', { name: 'Join waitlist' }).click()
      await expect(second.getByText(/waitlist at position 1/)).toBeVisible()
      const secondRow = await myEvents(second)
      await expect(secondRow).toContainText('Waitlisted · position 1')
      await signIn(third, 'Participant 3', `/events/${id}`)
      await third.getByRole('button', { name: 'Join waitlist' }).click()
      await expect(third.getByText(/waitlist at position 2/)).toBeVisible()
      const thirdRow = await myEvents(third)
      await expect(thirdRow).toContainText('Waitlisted · position 2')
      await first.getByRole('button', { name: `Leave event: ${title}` }).click()
      await expect(first.getByText('You left the event.')).toBeVisible()
      await second.reload()
      await third.reload()
      await expect(secondRow).toContainText('Joined')
      await expect(thirdRow).toContainText('Waitlisted · position 1')
      expect(roster()).toEqual([['joined', 1], ['left', 1], ['waitlisted', 1]])
    })

    await test.step('SYS-04 Organizer checks attendance, increases capacity, postpones, reschedules and deletes', async () => {
      await page.reload()
      const stat = (label: string) => page.locator('dl > div').filter({ has: page.getByText(label, { exact: true }) }).locator('dd')
      await expect(stat('Joined')).toHaveText('1')
      await expect(stat('Waitlisted')).toHaveText('1')
      await edit()
      await page.getByLabel('Participant capacity (optional)').fill('2')
      await save()
      await expect(stat('Joined')).toHaveText('2')
      await expect(stat('Waitlisted')).toHaveText('0')
      await third.reload()
      await expect(third.getByRole('listitem').filter({ hasText: title })).toContainText('Joined')

      await edit()
      await page.getByLabel('Status', { exact: true }).selectOption('postponed')
      await save()
      await expect(page.getByText('Event postponed.', { exact: true })).toBeVisible()
      await second.reload()
      await expect(second.getByRole('listitem').filter({ hasText: title })).toContainText('Postponed')
      await first.goto(`${app.url}/events/${id}`)
      await expect(first.getByRole('heading', { name: 'Event unavailable' })).toBeVisible()
      expect(roster()).toEqual([['joined', 2], ['left', 1]])

      await edit()
      await page.getByLabel('Start date and time').fill('2099-05-21T14:00')
      await page.getByLabel('End date and time').fill('2099-05-21T15:00')
      await page.getByLabel('Status', { exact: true }).selectOption('scheduled')
      await save()
      await expect(page.getByText('Event rescheduled.', { exact: true })).toBeVisible()
      await first.reload()
      await expect(first.getByRole('heading', { name: title })).toBeVisible()
      await expect(first.getByRole('button', { name: 'Join waitlist' })).toBeVisible()
      expect(roster()).toEqual([['joined', 2], ['left', 1]])

      await page.getByRole('button', { name: 'Delete', exact: true }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Delete event', exact: true }).click()
      await expect(page.getByText('Event deleted.', { exact: true })).toBeVisible()
      expect(roster()).toEqual([])
      expect(app.db.prepare('SELECT event_id FROM events WHERE event_id = ?').get(id)).toBeUndefined()
      await first.reload()
      await expect(first.getByRole('heading', { name: 'Event unavailable' })).toBeVisible()
    })
  } finally {
    await Promise.all([first.close(), second.close(), third.close()])
  }
})

test('A11Y-01 checks axe, focus, reduced motion, form labels and validation at representative sizes', async ({ page }) => {
  test.setTimeout(60_000)
  const sizes = [{ width: 1280, height: 800 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]
  async function scan(context: string) {
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), context).toEqual([])
  }
  async function responsive(context: string) {
    for (const size of sizes) {
      await page.setViewportSize(size)
      expect(await page.evaluate(() => document.documentElement.scrollWidth), context).toBe(size.width)
      await scan(`${context} at ${size.width}px`)
    }
  }

  await signIn(page, 'Participant 1')
  const deck = page.getByRole('region', { name: 'Event deck' })
  await expect(deck.getByRole('heading', { name: 'Transfer Student Coffee Meetup' })).toBeVisible()
  await page.keyboard.press('Tab')
  await deck.focus()
  await expect(deck).toBeFocused()
  await expect(deck).toHaveCSS('outline-style', 'solid')
  await expect(deck.getByRole('button', { name: 'Join', exact: true })).toBeEnabled()
  await expect(deck.getByRole('button', { name: 'Pass', exact: true })).toBeEnabled()
  await responsive('Participant discovery')
  await page.getByRole('link', { name: 'Map', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Available event locations' })).toBeVisible()
  await scan('Participant map at mobile width')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/events/discovery', async route => { await gate; await route.continue() })
  try {
    await page.getByRole('link', { name: 'Discover', exact: true }).click()
    await expect(page.getByText('Loading events…')).toBeVisible()
    await expect(page.locator('.spinner')).toHaveCSS('animation-name', 'none')
  } finally { release() }

  await page.getByRole('button', { name: 'Switch account' }).click()
  await selectDemoAccount(page, 'Organizer 1')
  await page.getByRole('link', { name: 'Create event' }).click()
  await page.getByRole('button', { name: 'Create event', exact: true }).click()
  const title = page.getByLabel('Event title')
  await expect(title).toBeFocused()
  await expect(title).toHaveAccessibleDescription('Enter a title.')
  await expect(page.getByRole('alert')).toContainText('Check the highlighted fields')
  await responsive('Validated organizer form')
})
