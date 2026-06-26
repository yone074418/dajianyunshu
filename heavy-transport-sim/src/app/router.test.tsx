import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from './router'

const supabaseMock = vi.hoisted(() => {
  const single = vi.fn()
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))

  return {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({ select })),
    query: {
      eq,
      select,
      single,
    },
  }
})

vi.mock('../services/supabase/client', () => ({
  supabase: {
    auth: supabaseMock.auth,
    from: supabaseMock.from,
  },
}))

function renderAt(path: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  })

  render(<RouterProvider router={router} />)

  return router
}

function mockNoSession() {
  supabaseMock.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  })
}

function mockProfile(role: 'student' | 'teacher' | 'admin') {
  supabaseMock.auth.getSession.mockResolvedValue({
    data: {
      session: {
        user: { id: 'user-1' },
      },
    },
    error: null,
  })
  supabaseMock.query.single.mockResolvedValue({
    data: {
      id: 'user-1',
      display_name: role === 'teacher' ? '测试教师' : '测试学生',
      role,
    },
    error: null,
  })
}

function mockProfileFailure() {
  supabaseMock.auth.getSession.mockResolvedValue({
    data: {
      session: {
        user: { id: 'user-1' },
      },
    },
    error: null,
  })
  supabaseMock.query.single.mockResolvedValue({
    data: null,
    error: { message: 'RLS rejected profile' },
  })
}

describe('Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabaseMock.from.mockReturnValue({
      select: supabaseMock.query.select,
    })
    supabaseMock.query.select.mockReturnValue({
      eq: supabaseMock.query.eq,
    })
    supabaseMock.query.eq.mockReturnValue({
      single: supabaseMock.query.single,
    })
    supabaseMock.auth.signOut.mockResolvedValue({ error: null })
  })

  it('redirects protected student page to login when there is no session', async () => {
    mockNoSession()

    renderAt('/student')

    expect(
      await screen.findByRole('heading', { level: 1, name: '登录' }),
    ).toBeInTheDocument()
  })

  it('restores a student session and renders /student', async () => {
    mockProfile('student')

    renderAt('/student')

    expect(
      await screen.findByRole('heading', { level: 1, name: '学生端' }),
    ).toBeInTheDocument()
    expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
  })

  it('restores a teacher session and renders /teacher', async () => {
    mockProfile('teacher')

    renderAt('/teacher')

    expect(
      await screen.findByRole('heading', { level: 1, name: '教师端' }),
    ).toBeInTheDocument()
  })

  it('logs out and returns to /login', async () => {
    mockProfile('student')
    supabaseMock.auth.signOut.mockImplementation(async () => {
      mockNoSession()
      return { error: null }
    })

    const router = renderAt('/student')
    await screen.findByRole('heading', { level: 1, name: '学生端' })

    await userEvent.click(screen.getByRole('button', { name: '退出登录' }))

    await waitFor(() => {
      expect(supabaseMock.auth.signOut).toHaveBeenCalledTimes(1)
      expect(router.state.location.pathname).toBe('/login')
    })
  })

  it('returns to login when profile loading fails', async () => {
    mockProfileFailure()

    renderAt('/teacher')

    expect(
      await screen.findByRole('heading', { level: 1, name: '登录' }),
    ).toBeInTheDocument()
  })

  it('renders login page at /login', async () => {
    mockNoSession()

    renderAt('/login')

    expect(
      await screen.findByRole('heading', { level: 1, name: '登录' }),
    ).toBeInTheDocument()
  })

  it('renders 404 page for unknown paths', async () => {
    mockNoSession()

    renderAt('/unknown')

    expect(
      await screen.findByRole('heading', { level: 1, name: '页面未找到' }),
    ).toBeInTheDocument()
  })

  it('renders global layout with navigation', async () => {
    mockProfile('student')

    renderAt('/student')

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: '大件运输虚拟仿真实验教学系统',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '学生端' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '教师端' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '登录' })).toBeInTheDocument()
  })

  it('restores role from root and navigates to /student', async () => {
    mockProfile('student')

    const router = renderAt('/')

    expect(
      await screen.findByRole('heading', { level: 1, name: '学生端' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/student')
  })
})
