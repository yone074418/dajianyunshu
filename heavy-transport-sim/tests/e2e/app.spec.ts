import { expect, test } from '@playwright/test'

test('loads the Day15 page and increments the counter', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Get started' }),
  ).toBeVisible()

  const counter = page.getByRole('button', { name: 'Count is 0' })
  await counter.click()

  await expect(page.getByRole('button', { name: 'Count is 1' })).toBeVisible()
})
