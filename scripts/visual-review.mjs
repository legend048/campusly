import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('.preview', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 })
await page.goto('http://localhost:5174', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1800)
async function revealPage() {
  await page.evaluate(async () => {
    for (let position = 0; position < document.documentElement.scrollHeight; position += 600) {
      window.scrollTo(0, position)
      await new Promise(resolve => setTimeout(resolve, 160))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(700)
}
await revealPage()
await page.screenshot({ path: '.preview/desktop-light.png', fullPage: true, animations: 'disabled' })
console.log(await page.evaluate(() => {
  const hero = document.querySelector('.featured-hero').getBoundingClientRect()
  const social = document.querySelector('.hero-social').getBoundingClientRect()
  const footer = document.querySelector('.hero-bottom').getBoundingClientRect()
  return { heroHeight: hero.height, socialBottom: social.bottom, footerTop: footer.top, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, brokenImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src) }
}))
await page.getByRole('button', { name: 'Dark', exact: true }).click()
await page.screenshot({ path: '.preview/desktop-dark.png', fullPage: true, animations: 'disabled' })
await page.getByRole('button', { name: 'Light', exact: true }).click()
await page.setViewportSize({ width: 390, height: 844 })
await revealPage()
await page.screenshot({ path: '.preview/mobile-light.png', fullPage: true, animations: 'disabled' })
await page.goto('http://localhost:5174/#calendar')
await page.screenshot({ path: '.preview/mobile-calendar.png', fullPage: true, animations: 'disabled' })
await browser.close()
