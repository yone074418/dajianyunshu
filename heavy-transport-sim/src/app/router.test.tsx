import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../stores/auth/useAuthStore'
import LoginPage from '../pages/login/LoginPage'
import StudentPage from '../pages/student/StudentPage'
import TeacherPage from '../pages/teacher/TeacherPage'
import ForbiddenPage from '../pages/forbidden/ForbiddenPage'
import NotFoundPage from '../pages/not-found/NotFoundPage'
import AuthGuard from './AuthGuard'
import RoleGuard from './RoleGuard'

function createTestRouter(initialEntries: string[]) {
  return createMemoryRouter(
    [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/403',
        element: <ForbiddenPage />,
      },
      {
        path: '/student',
        element: (
          <AuthGuard>
            <RoleGuard>
              <StudentPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: '/teacher',
        element: (
          <AuthGuard>
            <RoleGuard>
              <TeacherPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
    {
      initialEntries,
    },
  )
}

describe('Route Guards', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    sessionStorage.clear()
  })

  describe('Unauthenticated Access', () => {
    it('should redirect to login when accessing student page without auth', async () => {
      const router = createTestRouter(['/student'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/login')
      })
    })

    it('should redirect to login when accessing teacher page without auth', async () => {
      const router = createTestRouter(['/teacher'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/login')
      })
    })

    it('should show login page', async () => {
      const router = createTestRouter(['/login'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(
          screen.getByText(/大件运输虚拟仿真实验教学系统/),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Student Access', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: {
          id: 'student-1',
          email: 'student@test.com',
          role: 'student',
          name: '测试学生',
        },
        isAuthenticated: true,
        isLoading: false,
      })
    })

    it('should allow student to access student page', async () => {
      const router = createTestRouter(['/student'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(screen.getByText('学生端')).toBeInTheDocument()
      })
    })

    it('should redirect student to 403 when accessing teacher page', async () => {
      const router = createTestRouter(['/teacher'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/403')
      })
    })

    it('should show 403 page with correct message', async () => {
      const router = createTestRouter(['/teacher'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(screen.getByText('无权限访问')).toBeInTheDocument()
        expect(screen.getByText('当前账号无权访问此页面')).toBeInTheDocument()
      })
    })
  })

  describe('Teacher Access', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: {
          id: 'teacher-1',
          email: 'teacher@test.com',
          role: 'teacher',
          name: '测试教师',
        },
        isAuthenticated: true,
        isLoading: false,
      })
    })

    it('should allow teacher to access teacher page', async () => {
      const router = createTestRouter(['/teacher'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(screen.getByText('教师端')).toBeInTheDocument()
      })
    })

    it('should redirect teacher to 403 when accessing student page', async () => {
      const router = createTestRouter(['/student'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(router.state.location.pathname).toBe('/403')
      })
    })
  })

  describe('404 Handling', () => {
    it('should show 404 page for unknown routes', async () => {
      const router = createTestRouter(['/unknown-route'])
      render(<RouterProvider router={router} />)

      await waitFor(() => {
        expect(screen.getByText('页面未找到')).toBeInTheDocument()
      })
    })
  })
})
