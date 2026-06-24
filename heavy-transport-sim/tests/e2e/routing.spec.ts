import { expect, test } from '@playwright/test'

test('loads the student page at /student', async ({ page }) => {
  await page.goto('/student')
  await expect(
    page.getByRole('heading', { level: 1, name: '学生端' }),
  ).toBeVisible()
  await expect(page.getByText('功能将在后续任务实现')).toBeVisible()
})

test('loads the teacher page at /teacher', async ({ page }) => {
  await page.goto('/teacher')
  await expect(
    page.getByRole('heading', { level: 1, name: '教师端' }),
  ).toBeVisible()
  await expect(page.getByText('功能将在后续任务实现')).toBeVisible()
})

test('loads the login page at /login', async ({ page }) => {
  await page.goto('/login')
  await expect(
    page.getByRole('heading', { level: 1, name: '登录' }),
  ).toBeVisible()
  await expect(page.getByText('功能将在后续任务实现')).toBeVisible()
})

test('shows 404 page for unknown routes', async ({ page }) => {
  await page.goto('/unknown')
  await expect(
    page.getByRole('heading', { level: 1, name: '页面未找到' }),
  ).toBeVisible()
  await expect(page.getByText('您访问的页面不存在')).toBeVisible()
})

test('navigates between pages using nav links', async ({ page }) => {
  await page.goto('/student')

  await page.getByRole('link', { name: '教师端' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: '教师端' }),
  ).toBeVisible()

  await page.getByRole('link', { name: '登录' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: '登录' }),
  ).toBeVisible()

  await page.getByRole('link', { name: '学生端' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: '学生端' }),
  ).toBeVisible()
})

test('root path redirects to /student', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/student')
  await expect(
    page.getByRole('heading', { level: 1, name: '学生端' }),
  ).toBeVisible()
})

test('displays global layout with navigation', async ({ page }) => {
  await page.goto('/student')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: '大件运输虚拟仿真实验教学系统',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: '学生端' })).toBeVisible()
  await expect(page.getByRole('link', { name: '教师端' })).toBeVisible()
  await expect(page.getByRole('link', { name: '登录' })).toBeVisible()
})
