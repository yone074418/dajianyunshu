import { expect, test } from '@playwright/test'

test.describe('Vehicle Combination Page Access', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/student/vehicle-combinations')
    await expect(page).toHaveURL(/\/login/)
  })

  test('vehicle-combinations route exists and redirects properly', async ({
    page,
  }) => {
    await page.goto('/student/vehicle-combinations')
    await expect(page).toHaveURL(/\/login/)
    await expect(
      page.getByRole('main').getByText('大件运输虚拟仿真实验教学系统'),
    ).toBeVisible()
  })
})
