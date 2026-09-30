import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-30T08:00:00+05:30'))
})

test('discovery search, category, filters and views work', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.event-card')).toHaveCount(7)
  await expect(page.getByRole('heading', { name: 'Find your next good story.' })).toBeVisible()
  await page.getByRole('button', { name: 'Technology', exact: true }).click()
  await expect(page.locator('.event-card')).toHaveCount(1)
  await expect(page.locator('.event-card h3')).toHaveText('Hack the Future 2026')
  await page.getByRole('button', { name: 'All events', exact: true }).click()
  await page.getByRole('button', { name: 'More filters' }).click()
  await page.getByLabel('Free events only').check()
  await expect(page.locator('.event-card')).toHaveCount(4)
  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.locator('.events-grid')).toHaveClass(/list-view/)
  await page.getByRole('button', { name: 'Reset filters' }).click()
  await page.getByRole('textbox', { name: 'Search events' }).fill('basketball')
  await expect(page.locator('.event-card')).toHaveCount(1)
  await page.getByRole('textbox', { name: 'Search events' }).fill('there is no such event')
  await expect(page.getByText('Nothing here just yet.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(page.locator('.event-card')).toHaveCount(7)
})

test('saved events and dark mode survive reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Save Hack the Future 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Dark', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: /Saved events/ }).click()
  await expect(page.locator('.event-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Unsave Hack the Future 2026', exact: true }).click()
  await expect(page.getByText('Save a little possibility.')).toBeVisible()
  await page.getByRole('button', { name: 'Light', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('registration, download, duplicate prevention and cancellation work', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'View Hack the Future 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Count me in' }).click()
  await page.getByLabel('Full name', { exact: true }).fill('Jordan Lee')
  await page.getByLabel('College email').fill('jordan@college.edu')
  await page.getByLabel('Course & year').fill('Engineering, Year 3')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Confirm registration' }).click()
  await expect(page.getByRole('heading', { name: 'See you there, Jordan.' })).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download pass', exact: true }).click()
  expect((await download).suggestedFilename()).toMatch(/^CP-.*-pass.txt$/)
  const calendar = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Add to calendar', exact: true }).click()
  expect((await calendar).suggestedFilename()).toBe('hack-the-future.ics')
  await page.getByRole('button', { name: 'See all my tickets' }).click()
  await expect(page.locator('.ticket-card')).toHaveCount(1)
  await page.reload()
  await expect(page.locator('.ticket-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Discover', exact: true }).click()
  await page.getByRole('button', { name: 'View Hack the Future 2026', exact: true }).click()
  await expect(page.getByRole('button', { name: 'View your pass' })).toBeVisible()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: /My tickets/ }).click()
  await page.getByRole('button', { name: 'Cancel registration', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cancel registration', exact: true })
    .click()
  await expect(page.getByText('Let’s put something on the calendar.')).toBeVisible()
})

test('event creation, edit, registration, attendee export and delete stay consistent', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Host an event', exact: true }).click()
  await page.getByLabel('Event name').fill('Campus Maker Night')
  await page.getByLabel('Category', { exact: true }).selectOption('Technology')
  await page.getByLabel('Hosted by').fill('Maker Club')
  await page.getByLabel('Date', { exact: true }).fill('2027-11-10')
  await page.getByLabel('Venue', { exact: true }).fill('Engineering Studio')
  await page.getByLabel('Capacity', { exact: true }).fill('1')
  await page
    .getByLabel('Tell people about it')
    .fill('Build your next creative project with friends at our hands-on campus maker night.')
  await page.getByRole('button', { name: 'Publish event' }).click()
  await expect(page.locator('.hosted-row')).toHaveCount(1)
  await page.getByRole('button', { name: 'Edit Campus Maker Night', exact: true }).click()
  await page.getByLabel('Event name').fill('Campus Maker Evening')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.locator('.hosted-info')).toContainText('Campus Maker Evening')
  await page.getByRole('button', { name: 'Campus Maker Evening', exact: true }).click()
  await page.getByRole('button', { name: 'Count me in' }).click()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Confirm registration' }).click()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await expect(page.locator('.stat-card').nth(1).locator('strong')).toHaveText('1')
  await expect(page.locator('.stat-card').nth(2).locator('strong')).toHaveText('0')
  const download = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Export attendees for Campus Maker Evening', exact: true })
    .click()
  expect((await download).suggestedFilename()).toContain('attendees.csv')
  await page.getByRole('button', { name: 'Delete Campus Maker Evening', exact: true }).click()
  await page.getByRole('button', { name: 'Delete event', exact: true }).click()
  await expect(page.locator('.hosted-row')).toHaveCount(0)
  await page.getByRole('button', { name: /My tickets/ }).click()
  await expect(page.locator('.ticket-card')).toHaveCount(0)
})

test('calendar and community filters work', async ({ page }) => {
  await page.goto('/#calendar')
  await expect(page.getByRole('heading', { name: 'October 2026' })).toBeVisible()
  await expect(page.locator('.agenda-row')).toHaveCount(7)
  await page.getByRole('button', { name: 'Show events on October 3', exact: true }).click()
  await expect(page.locator('.agenda-row')).toHaveCount(1)
  await page.getByRole('button', { name: 'Next month' }).click()
  await expect(page.getByRole('heading', { name: 'November 2026' })).toBeVisible()
  await page.getByRole('button', { name: 'Communities', exact: true }).click()
  await expect(page.locator('.club-card')).toHaveCount(6)
  await page.locator('.club-card').first().getByRole('button', { name: 'Join community' }).click()
  await page.getByRole('button', { name: /My communities/ }).click()
  await expect(page.locator('.club-card')).toHaveCount(1)
  await page.reload()
  await expect(
    page.locator('.club-card').first().getByRole('button', { name: 'Joined', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'View events by Developer Student Club' }).click()
  await expect(page.locator('.event-card')).toHaveCount(1)
  await expect(page.locator('.event-card h3')).toHaveText('Hack the Future 2026')
})

test('profile, keyboard search, notifications and help work', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Edit your profile' }).click()
  await page.getByLabel('Full name').fill('Riley Taylor')
  await page.getByLabel('Your campus').fill('Westbridge College')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.locator('.greeting')).toContainText('HEY RILEY')
  await expect(page.locator('.campus-selector')).toContainText('Westbridge College')
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('textbox', { name: 'Search events' })).toBeFocused()
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  await expect(page.getByText('The campus buzz')).toBeVisible()
  await page.getByRole('button', { name: 'Mark all notifications as read' }).click()
  await expect(page.getByText('You’re all caught up. Here’s what’s next.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.notifications-panel')).toHaveCount(0)
  await page.getByRole('button', { name: 'A little help?' }).click()
  await page.getByText('Where are my details saved?', { exact: true }).click()
  await expect(
    page.getByText('This is an interactive campus demo.', { exact: false }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

for (const width of [360, 768, 1440]) {
  test(`responsive layout has no overflow at ${width}px and images load`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.waitForFunction(() =>
      [...document.images]
        .filter((image) => image.loading !== 'lazy')
        .every((image) => image.complete && image.naturalWidth > 0),
    )
    await expect(page.locator('body')).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy()
    if (width < 901) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await expect(page.locator('.sidebar')).toHaveClass(/open/)
      await page.getByRole('button', { name: 'Dark', exact: true }).click()
      await page.getByRole('button', { name: 'Close navigation' }).click()
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    }
    for (const route of ['calendar', 'clubs', 'tickets', 'dashboard']) {
      await page.goto('/#' + route)
      await expect(page.locator('h1')).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} overflow at ${width}`,
      ).toBeTruthy()
    }
    expect(errors).toEqual([])
  })
}

test('reduced motion keeps content visible and stops looping animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.hero-copy h2')).toBeVisible()
  await expect(page.locator('.event-card').first()).toHaveCSS('opacity', '1')
  await expect(page.locator('.page-heading')).toBeVisible()
})
