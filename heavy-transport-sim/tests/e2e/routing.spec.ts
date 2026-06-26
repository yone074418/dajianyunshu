import { expect, test } from '@playwright/test'

test.describe('Unauthenticated Access', () => {
  test('redirects to login when accessing student page without auth', async ({ page }) => {
    await page.goto('/student')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('main').getByText('大件运输虚拟仿真实验教学系统')).toBeVisible()
  })

  test('redirects to login when accessing teacher page without auth', async ({ page }) => {
    await page.goto('/teacher')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('main').getByText('大件运输虚拟仿真实验教学系统')).toBeVisible()
  })

  test('shows login page at /login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('main').getByText('大件运输虚拟仿真实验教学系统')).toBeVisible()
    await expect(page.getByLabel('邮箱')).toBeVisible()
    await expect(page.getByLabel('密码')).toBeVisible()
  })
})

test.describe('Student Login and Access', () => {
  test('student can login and access student page', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('邮箱').fill('student@test.com')
    await page.getByLabel('密码').fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL('/student')
    await expect(page.getByRole('heading', { name: '学生端' })).toBeVisible()
    await expect(page.getByText('欢迎，测试学生')).toBeVisible()
  })

  test('student cannot access teacher page directly via URL', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('邮箱').fill('student@test.com')
    await page.getByLabel('密码').fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL('/student')

    await page.evaluate(() => {
      window.location.href = '/teacher'
    })

    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
  })

  test('student can logout and is redirected to login', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('邮箱').fill('student@test.com')
    await page.getByLabel('密码').fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL('/student')

    await page.getByRole('navigation').getByRole('button', { name: '退出登录' }).click()

    await expect(page).toHaveURL('/login')
  })
})

test.describe('Teacher Login and Access', () => {
  test('teacher can login and access teacher page', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('邮箱').fill('teacher@test.com')
    await page.getByLabel('密码').fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL('/teacher')
    await expect(page.getByRole('heading', { name: '教师端' })).toBeVisible()
    await expect(page.getByText('欢迎，测试教师')).toBeVisible()
  })

  test('teacher cannot access student page directly via URL', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('邮箱').fill('teacher@test.com')
    await page.getByLabel('密码').fill('password123')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL('/teacher')

    await page.evaluate(() => {
      window.location.href = '/student'
    })

    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
  })
})

test.describe('404 Handling', () => {
  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown')
    await expect(page.getByRole('heading', { name: '页面未找到' })).toBeVisible()
  })
})

test.describe('Root Path', () => {
  test('root path redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})
