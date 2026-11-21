import { mkdtempSync, rmSync } from 'node:fs'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, type BrowserContext, type Page } from '@playwright/test'
import { createApp } from '../../dist/server/backend/src/app.js'
import { openDatabase } from '../../dist/server/backend/src/data/database.js'

export async function startBrowserApp() {
  const directory = mkdtempSync(join(tmpdir(), 'spartin-browser-'))
  const db = openDatabase(join(directory, 'browser.sqlite'))
  try {
    const app = createApp(db, { clientDirectory: resolve('dist/client') })
    const server = await new Promise<Server>((resolve, reject) => {
      const listener = app.listen(0, '127.0.0.1', () => resolve(listener)).once('error', reject)
    })
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    return {
      url, db,
      stop: async () => {
        try {
          await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
        } finally {
          db.close()
          rmSync(directory, { recursive: true, force: true })
        }
      },
    }
  } catch (error) {
    db.close()
    rmSync(directory, { recursive: true, force: true })
    throw error
  }
}

export async function selectDemoAccount(page: Page, name: string) {
  await expect(page.getByText('Simulated authentication')).toBeVisible()
  await page.getByRole('button', { name: new RegExp(name) }).click()
}

export const streetTiles = 'https://tile.openstreetmap.org/**'

export function stubStreetTiles(target: BrowserContext | Page, unavailable = false) {
  return target.route(streetTiles, route => unavailable ? route.abort()
    : route.fulfill({
      contentType: 'image/gif',
      body: Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64'),
    }))
}
