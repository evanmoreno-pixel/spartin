import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  use: {
    channel: process.env.SPARTIN_BROWSER_CHANNEL,
    viewport: { width: 1280, height: 800 },
    timezoneId: 'America/Los_Angeles',
    screenshot: 'only-on-failure',
  },
})
