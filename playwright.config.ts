import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const installedChrome = existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe')

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 3,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: process.env.PLAYWRIGHT_CHANNEL || (installedChrome ? 'chrome' : undefined),
    viewport: { width: 1440, height: 1000 },
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
  },
  reporter: [['list']],
})
