import { readFileSync } from 'node:fs'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { selectDemoAccount, startBrowserApp, streetTiles, stubStreetTiles } from './localApp'

let app: Awaited<ReturnType<typeof startBrowserApp>>

test.beforeEach(async () => { app = await startBrowserApp() })
test.afterEach(async () => { await app?.stop() })

async function openAsParticipant(page: Page, path = '/') {
  await page.goto(app.url + path)
  await selectDemoAccount(page, 'Participant 1')
}

async function createEvent(request: APIRequestContext) {
  const account = await request.post(`${app.url}/api/session`, { data: { accountKey: 'organizer-1' } })
  expect(account.ok()).toBe(true)
  const result = await request.post(`${app.url}/api/events`, { data: {
    title: 'Downtown Research Meetup',
    location: '150 E San Fernando St, San José, CA',
    description: 'Bring notes, a draft; and questions.',
    startTime: '2099-04-12T14:00:00-07:00',
    endTime: '2099-04-12T15:30:00-07:00',
  } })
  expect(result.status()).toBe(201)
  return (await result.json()).data.eventId as string
}

test('FR-04 plots campus and off-campus pins and opens selected details and directions', async ({ page }) => {
  await stubStreetTiles(page)
  await page.goto(app.url)
  await selectDemoAccount(page, 'Organizer 1')
  await page.getByRole('link', { name: 'Create event' }).click()
  await page.getByLabel('Event title').fill('Downtown Research Meetup')
  await page.getByLabel('Location', { exact: true }).fill('San José City Hall, 200 E Santa Clara St')
  await page.getByLabel('Start date and time').fill('2099-04-12T14:00')
  await page.getByLabel('End date and time').fill('2099-04-12T15:30')
  await page.getByText('Map pin (optional)', { exact: true }).click()
  await page.getByLabel('Latitude', { exact: true }).fill('91')
  await page.getByRole('button', { name: 'Create event', exact: true }).click()
  await expect(page.getByText(/Enter a latitude between/)).toBeVisible()
  await page.getByLabel('Latitude', { exact: true }).fill('37.33781')
  await page.getByLabel('Longitude', { exact: true }).fill('-121.88601')
  await page.getByRole('button', { name: 'Create event', exact: true }).click()
  await expect(page.getByText('Event created.', { exact: true })).toBeVisible()
  const id = page.url().split('/').at(-1)!
  await page.getByRole('button', { name: 'Switch account' }).click()
  await selectDemoAccount(page, 'Participant 1')
  await page.getByRole('link', { name: 'Map', exact: true }).click()

  const map = page.getByRole('region', { name: 'Available event locations' })
  await expect(map.getByRole('button', { name: 'Library Study Jam' })).toBeVisible()
  await expect(map.getByRole('button', { name: /Transfer Student Coffee Meetup.*Board Games at the Union/ })).toBeVisible()
  await expect(map.getByRole('button', { name: 'Spartan Campus Walk' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: '© OpenStreetMap contributors' })).toBeVisible()
  await expect(page.getByText('Loading street map…')).toHaveCount(0)
  const marker = map.getByRole('button', { name: 'Downtown Research Meetup' })
  await expect(marker).toHaveCSS('display', 'grid')
  await marker.press('Enter')
  const selected = page.getByRole('region', { name: 'Selected events' })
  await expect(selected.getByRole('heading', { name: 'Downtown Research Meetup' })).toBeVisible()
  const directions = new URL((await selected.getByRole('link', { name: 'Directions' }).getAttribute('href'))!)
  expect(directions.searchParams.get('destination')).toBe('37.33781,-121.88601')
  expect(directions.searchParams.get('origin')).toBeNull()
  await selected.getByRole('link', { name: 'View event details' }).click()
  await expect(page).toHaveURL(`${app.url}/participant/events/${id}`)
  const preview = page.getByRole('region', { name: 'Event location map' })
  await expect(preview.getByRole('img', { name: 'San José City Hall, 200 E Santa Clara St' })).toBeVisible()
  const backUrl = `${app.url}/participant/map`
  await page.goto(backUrl)
  await page.getByRole('link', { name: 'Spartan Campus Walk' }).click()
  await expect(page.getByText(/A map pin is unavailable/)).toBeVisible()
  const textDirections = new URL((await page.getByRole('link', { name: 'Directions' }).getAttribute('href'))!)
  expect(textDirections.searchParams.get('destination')).toBe('Tower Hall Lawn')
})

test('FR-04 and FR-06 retain the map and browsing when tiles or permission fail, and keep GPS local', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['geolocation'],
    geolocation: { latitude: 37.731234, longitude: -122.421234, accuracy: 43 },
  })
  try {
    await stubStreetTiles(context, true)
    const page = await context.newPage()
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    const requests: string[] = []
    const writes: string[] = []
    page.on('request', request => {
      if (request.url().startsWith('https://tile.openstreetmap.org/')) requests.push(request.url())
      if (request.url().includes('/api/') && request.method() !== 'GET') writes.push(request.url())
    })
    await openAsParticipant(page, '/events/library-study')
    await expect(page.getByRole('heading', { name: 'Library Study Jam' })).toBeVisible()
    await page.getByRole('link', { name: /back to available events/i }).click()
    await page.getByRole('link', { name: 'Map', exact: true }).click()
    await expect(page.getByText(/Street tiles are unavailable/)).toBeVisible()
    const map = page.getByRole('region', { name: 'Available event locations' })
    await expect(map.getByRole('button', { name: 'Library Study Jam' })).toBeVisible()
    await expect(map.getByRole('img', { name: 'Your approximate location' })).toHaveCount(0)
    await context.unroute(streetTiles)
    await stubStreetTiles(context)
    await page.getByRole('button', { name: 'Refresh', exact: true }).click()
    const loadedTile = map.locator('.leaflet-tile-loaded').first()
    await expect(loadedTile).toBeVisible()
    await expect(page.getByText('Loading street map…')).toHaveCount(0)
    const before = requests.length
    const eventsBefore = app.db.prepare('SELECT * FROM events ORDER BY event_id').all()
    await page.getByRole('button', { name: 'Use my location' }).click()
    await expect(map.getByRole('img', { name: 'Your approximate location' })).toBeVisible()
    await expect(page.getByText(/reported accuracy/)).toContainText('43 m')
    await expect(page.getByText(/Street tiles are paused/)).toBeVisible()
    await expect(map.locator('.leaflet-tile-loaded')).toHaveCount(0)
    await map.getByRole('button', { name: 'Zoom in' }).click()
    expect(requests).toHaveLength(before)
    expect(writes).toEqual([`${app.url}/api/session`])
    expect(app.db.prepare('SELECT * FROM events ORDER BY event_id').all()).toEqual(eventsBefore)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    await page.getByRole('button', { name: 'Stop using my location' }).click()
    await expect(map.getByRole('img', { name: 'Your approximate location' })).toHaveCount(0)
    await expect(loadedTile).toBeVisible()

    await page.evaluate(() => {
      Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
        value: (_success: PositionCallback, failure: PositionErrorCallback) => failure({ code: 1 } as GeolocationPositionError),
        configurable: true,
      })
    })
    await page.getByRole('button', { name: 'Use my location' }).click()
    await expect(page.getByRole('alert')).toContainText('Location permission was denied')
    await page.getByRole('link', { name: 'Browse all', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Library Study Jam' })).toBeVisible()
    expect(pageErrors).toEqual([])
  } finally {
    await context.close()
  }
})

test('FR-05 shares clean links, copies them, and restores a destination after demo sign-in', async ({ browser, browserName, page, context }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await stubStreetTiles(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: (data: ShareData) => { Reflect.set(window, 'observedShare', data); return Promise.resolve() },
      configurable: true,
    })
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
  })
  await openAsParticipant(page, '/events/library-study')
  await expect(page.getByRole('heading', { name: 'Library Study Jam' })).toBeVisible()
  await page.getByRole('button', { name: 'Share event' }).click()
  await expect(page.getByText('Share request completed.')).toBeVisible()
  const shared = await page.evaluate(() => Reflect.get(window, 'observedShare'))
  expect(shared).toEqual({ title: 'Library Study Jam', url: `${app.url}/events/library-study` })

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })
  await page.getByRole('button', { name: 'Share event' }).click()
  await expect(page.getByLabel('Event link')).toHaveValue(shared.url)
  if (browserName === 'chromium') {
    await page.getByRole('button', { name: 'Copy link' }).click()
    await expect(page.getByText('Event link copied.')).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shared.url)
  }

  const receiving = await browser.newPage()
  try {
    await stubStreetTiles(receiving)
    await receiving.goto(shared.url)
    await selectDemoAccount(receiving, 'Participant 2')
    await expect(receiving).toHaveURL(shared.url)
    await expect(receiving.getByRole('heading', { name: 'Library Study Jam' })).toBeVisible()
    await expect(receiving.getByRole('button', { name: 'Join', exact: true })).toBeVisible()
  } finally {
    await receiving.close()
  }
})

test('FR-08 opens the Google Calendar draft link and downloads an ICS without changing participation', async ({ page, context, request }) => {
  const id = await createEvent(request)
  await openAsParticipant(page, `/events/${id}`)
  await expect(page.getByRole('heading', { name: 'Downtown Research Meetup' })).toBeVisible()
  await page.getByRole('button', { name: 'Join', exact: true }).click()
  await expect(page.getByText('You joined the event.')).toBeVisible()
  const before = app.db.prepare('SELECT * FROM participation').all()
  expect(before).toHaveLength(1)

  await context.route('https://calendar.google.com/**', route => route.fulfill({ status: 200, body: 'Calendar draft handoff' }))
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Add to Google Calendar' }).click(),
  ])
  try {
    await popup.waitForLoadState()
    const destination = new URL(popup.url())
    expect(destination.origin).toBe('https://calendar.google.com')
    expect(Object.fromEntries(destination.searchParams)).toMatchObject({
      action: 'TEMPLATE', text: 'Downtown Research Meetup', details: 'Bring notes, a draft; and questions.',
      dates: '20990412T210000Z/20990412T223000Z', location: '150 E San Fernando St, San José, CA',
    })
  } finally {
    await popup.close()
  }
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download calendar file' }).click(),
  ])
  expect(download.suggestedFilename()).toBe(`spartin-${id}.ics`)
  const contents = readFileSync(await download.path(), 'utf8')
  expect(contents).toContain('DTSTART:20990412T210000Z\r\nDTEND:20990412T223000Z')
  expect(contents).toContain('DESCRIPTION:Bring notes\\, a draft\\; and questions.')
  expect(app.db.prepare('SELECT * FROM participation').all()).toEqual(before)
})
