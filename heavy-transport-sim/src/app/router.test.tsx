import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AppLayout from '../layouts/AppLayout'
import StudentPage from '../pages/student/StudentPage'
import TeacherPage from '../pages/teacher/TeacherPage'
import LoginPage from '../pages/login/LoginPage'
import NotFoundPage from '../pages/not-found/NotFoundPage'
import { Navigate } from 'react-router-dom'

const testRoutes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/student" replace />,
      },
      {
        path: 'student',
        element: <StudentPage />,
      },
      {
        path: 'teacher',
        element: <TeacherPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

describe('Routing', () => {
  it('renders student page at /student', () => {
    const router = createMemoryRouter(testRoutes, {
      initialEntries: ['/student'],
    })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { level: 1, name: '学生端' }),
    ).toBeInTheDocument()
  })

  it('renders teacher page at /teacher', () => {
    const router = createMemoryRouter(testRoutes, {
      initialEntries: ['/teacher'],
    })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { level: 1, name: '教师端' }),
    ).toBeInTheDocument()
  })

  it('renders login page at /login', () => {
    const router = createMemoryRouter(testRoutes, {
      initialEntries: ['/login'],
    })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { level: 1, name: '登录' }),
    ).toBeInTheDocument()
  })

  it('renders 404 page for unknown paths', () => {
    const router = createMemoryRouter(testRoutes, {
      initialEntries: ['/unknown'],
    })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { level: 1, name: '页面未找到' }),
    ).toBeInTheDocument()
  })

  it('renders global layout with navigation', () => {
    const router = createMemoryRouter(testRoutes, {
      initialEntries: ['/student'],
    })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '大件运输虚拟仿真实验教学系统',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '学生端' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '教师端' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '登录' })).toBeInTheDocument()
  })

  it('navigates to /student from root', () => {
    const router = createMemoryRouter(testRoutes, {
      initialEntries: ['/'],
    })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { level: 1, name: '学生端' }),
    ).toBeInTheDocument()
  })
})
