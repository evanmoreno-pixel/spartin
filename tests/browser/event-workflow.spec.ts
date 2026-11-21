import type { DatabaseSync } from 'node:sqlite'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { selectDemoAccount, startBrowserApp, stubStreetTiles } from './localApp'

let app: Awaited<ReturnType<typeof startBrowserApp>>
let db: DatabaseSync
let url: string

test.beforeEach(async ({ page }) => {
  app = await startBrowserApp()
  db = app.db
  url = app.url
  await stubStreetTiles(page)
})

test.afterEach(async () => {
  await app?.stop()
})

async function openDiscovery(page: Page, name = 'Participant 1') {
  await selectAccount(page, name)
  const deck = page.getByRole('region', { name: 'Event deck' })
  await expect(deck.getByRole('heading')).toBeVisible()
  return deck
}

async function publish(request: APIRequestContext, capacity: number, waitlistEnabled: boolean) {
  const account = await request.post(`${url}/api/session`, { data: { accountKey: 'organizer-1' } })
  expect(account.ok()).toBe(true)
  const response = await request.post(`${url}/api/events`, { data: {
    title: 'Workshop at the Union', location: 'Student Union',
    startTime: new Date(Date.now() + 12 * 3_600_000).toISOString(),
    endTime: new Date(Date.now() + 13 * 3_600_000).toISOString(),
    capacity, waitlistEnabled,
  } })
  expect(response.status()).toBe(201)
  return (await response.json()).data.eventId as string
}

test('FR-01 mouse swipes, arrow keys, and buttons share the persisted Join and Pass actions', async ({ page }) => {
  const writes: string[] = []
  page.on('request', request => {
    if (request.method() === 'POST' && /\/(join|pass)$/.test(request.url())) writes.push(request.url().split('/').slice(-2).join('/'))
  })
  const deck = await openDiscovery(page)
  const surface = deck.locator('.swipe-surface')
  async function drag(direction: number) {
    const box = (await surface.boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + 40
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + direction * 110, y, { steps: 7 })
    await page.mouse.up()
  }

  await expect(deck.getByRole('heading', { name: 'Transfer Student Coffee Meetup' })).toBeVisible()
  await surface.locator('.date-tile').click()
  await expect(page.getByRole('heading', { name: 'Transfer Student Coffee Meetup' })).toBeVisible()
  await expect(page).toHaveURL(/participant\/events\/transfer-coffee$/)
  await page.goBack()
  await expect(deck.getByRole('button', { name: 'Join', exact: true })).toBeEnabled()
  await drag(1)
  await expect(deck.getByRole('heading', { name: 'Library Study Jam' })).toBeVisible()
  await expect(deck.getByRole('button', { name: 'Pass', exact: true })).toBeEnabled()
  await drag(-1)
  await expect(deck.getByRole('heading', { name: 'Spartan Campus Walk' })).toBeVisible()
  await expect(deck.getByRole('button', { name: 'Join', exact: true })).toBeEnabled()
  await deck.press('ArrowRight')
  await expect(deck.getByRole('heading', { name: 'Resume Workshop' })).toBeVisible()
  await expect(deck.getByRole('button', { name: 'Pass', exact: true })).toBeEnabled()
  await deck.press('ArrowLeft')
  await expect(deck.getByRole('heading', { name: 'Board Games at the Union' })).toBeVisible()
  await deck.getByRole('button', { name: 'Join', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No available events' })).toBeVisible()
  await page.getByRole('link', { name: 'My events', exact: true }).click()
  await page.getByRole('button', { name: 'Leave event: Transfer Student Coffee Meetup' }).click()
  await expect(page.getByText('You left the event.')).toBeVisible()
  await page.getByRole('link', { name: 'Discover', exact: true }).click()
  await expect(deck.getByText('Left', { exact: true })).toBeVisible()
  await deck.getByRole('button', { name: 'Pass', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No available events' })).toBeVisible()
  expect(writes).toEqual([
    'transfer-coffee/join', 'library-study/pass', 'campus-walk/join',
    'resume-workshop/pass', 'board-games/join', 'transfer-coffee/pass',
  ])
  expect(db.prepare('SELECT event_id, status FROM participation ORDER BY event_id').all()).toEqual([
    { event_id: 'board-games', status: 'joined' }, { event_id: 'campus-walk', status: 'joined' },
    { event_id: 'library-study', status: 'passed' }, { event_id: 'resume-workshop', status: 'passed' },
    { event_id: 'transfer-coffee', status: 'passed' },
  ])
})

test('FR-01 blocks repeat submissions and retains the card when a join fails', async ({ page, request }) => {
  const eventId = await publish(request, 0, false)
  let submissions = 0
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route(`**/api/events/${eventId}/join`, async route => {
    submissions++
    await gate
    await route.continue()
  })
  try {
    const deck = await openDiscovery(page)
    await expect(deck.getByRole('heading', { name: 'Workshop at the Union' })).toBeVisible()
    await expect(deck.getByText('Full', { exact: true })).toBeVisible()
    await deck.getByRole('button', { name: 'Join', exact: true }).click()
    await expect(deck.getByRole('button', { name: 'Join', exact: true })).toBeDisabled()
    await deck.press('ArrowRight')
    await deck.press('ArrowLeft')
    release()
    await expect(page.getByRole('alert')).toContainText('This event is full')
    await expect(deck.getByRole('heading', { name: 'Workshop at the Union' })).toBeVisible()
    expect(submissions).toBe(1)
    expect(db.prepare('SELECT status FROM participation WHERE event_id = ?').all(eventId)).toEqual([])
    await deck.getByRole('button', { name: 'Pass', exact: true }).click()
    await expect(deck.getByRole('heading', { name: 'Transfer Student Coffee Meetup' })).toBeVisible()
  } finally {
    release()
  }
})

test('FR-03 and FR-07 touch enrollment, waitlist positions and FIFO promotion appear in My events', async ({ browser, page, request }) => {
  const eventId = await publish(request, 1, true)
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const third = await browser.newPage()
  try {
    const mobileDeck = await openDiscovery(mobile)
    await mobile.bringToFront()
    const input = await mobile.context().newCDPSession(mobile)
    async function swipe(direction: number) {
      const surface = mobileDeck.locator('.swipe-surface')
      await surface.scrollIntoViewIfNeeded()
      await expect(mobileDeck.getByRole('button', { name: 'Pass', exact: true })).toBeEnabled()
      const box = (await surface.boundingBox())!
      const x = Math.round(box.x + box.width / 2)
      const y = Math.round(box.y + 42)
      await input.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
      for (const dx of [25, 58, 92, 114]) {
        await input.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * direction, y }] })
      }
      await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    }
    await swipe(1)
    await expect(mobile.getByText('You joined the event.')).toBeVisible()
    await expect(mobileDeck.getByRole('heading', { name: 'Transfer Student Coffee Meetup' })).toBeVisible()
    await swipe(-1)
    await expect(mobile.getByText('Event passed.')).toBeVisible()
    await expect(mobileDeck.getByRole('heading', { name: 'Library Study Jam' })).toBeVisible()
    expect(db.prepare('SELECT status FROM participation WHERE event_id = ?').get('transfer-coffee')).toEqual({ status: 'passed' })
    expect(await mobile.evaluate(() => document.documentElement.scrollWidth)).toBe(390)

    const secondDeck = await openDiscovery(page, 'Participant 2')
    await secondDeck.getByRole('button', { name: 'Join waitlist' }).click()
    await expect(page.getByText('You’re on the waitlist at position 1.')).toBeVisible()
    const thirdDeck = await openDiscovery(third, 'Participant 3')
    await thirdDeck.getByRole('button', { name: 'Join waitlist' }).click()
    await expect(third.getByText('You’re on the waitlist at position 2.')).toBeVisible()

    for (const user of [mobile, page, third]) await user.getByRole('link', { name: 'My events', exact: true }).click()
    await expect(page.getByText('Waitlisted · position 1', { exact: true })).toBeVisible()
    await expect(third.getByText('Waitlisted · position 2', { exact: true })).toBeVisible()
    await mobile.getByRole('button', { name: 'Leave event: Workshop at the Union' }).click()
    await expect(mobile.getByText('You left the event.')).toBeVisible()
    await page.reload()
    await third.reload()
    await expect(page.getByText('Joined', { exact: true })).toBeVisible()
    await expect(third.getByText('Waitlisted · position 1', { exact: true })).toBeVisible()
    await third.getByRole('button', { name: 'Leave event: Workshop at the Union' }).click()
    await expect(third.getByRole('heading', { name: 'No joined or waitlisted events' })).toBeVisible()
    expect(db.prepare('SELECT status FROM participation WHERE event_id = ? ORDER BY user_id').all(eventId))
      .toEqual([{ status: 'left' }, { status: 'joined' }, { status: 'left' }])
  } finally {
    await mobile.close()
    await third.close()
  }
})

async function selectAccount(page: Page, name: string) {
  await page.goto(url)
  await selectDemoAccount(page, name)
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
    await page.getByLabel('Allow waitlist enrollment when full').check()
    await page.getByLabel('Start date and time').fill('2099-04-12T14:00')
    await page.getByLabel('End date and time').fill('2099-04-12T15:00')
    await page.getByRole('button', { name: 'Create event' }).click()
    await expect(page.getByText('Event created.', { exact: true })).toBeVisible()
    const organizerUrl = page.url()
    const id = organizerUrl.split('/').at(-1)!
    expect(db.prepare('SELECT title, capacity, waitlist_enabled FROM events WHERE event_id = ?').get(id))
      .toMatchObject({ title: 'First-Gen Study Circle', capacity: 14, waitlist_enabled: 1 })
    await expect(page.getByText('Enabled', { exact: true })).toBeVisible()
    await otherOrganizer.goto(`${organizerUrl}/edit`)
    await expect(otherOrganizer.getByRole('heading', { name: 'Event unavailable' })).toBeVisible()

    await participant.getByRole('link', { name: 'Browse all' }).click()
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
