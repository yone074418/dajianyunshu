import { create } from 'zustand'
import type { AuthStore, User, UserRole } from '../../types/auth'

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'student@test.com': {
    password: 'password123',
    user: {
      id: 'student-1',
      email: 'student@test.com',
      role: 'student',
      name: '测试学生',
    },
  },
  'teacher@test.com': {
    password: 'password123',
    user: {
      id: 'teacher-1',
      email: 'teacher@test.com',
      role: 'teacher',
      name: '测试教师',
    },
  },
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser = MOCK_USERS[email]

    if (!mockUser || mockUser.password !== password) {
      set({
        isLoading: false,
        error: '邮箱或密码错误',
      })
      return
    }

    set({
      user: mockUser.user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  },

  logout: async () => {
    set({ isLoading: true })

    await new Promise((resolve) => setTimeout(resolve, 300))

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  checkSession: async () => {
    set({ isLoading: true })

    await new Promise((resolve) => setTimeout(resolve, 200))

    const savedUser = sessionStorage.getItem('auth_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        sessionStorage.removeItem('auth_user')
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

useAuthStore.subscribe((state) => {
  if (state.user) {
    sessionStorage.setItem('auth_user', JSON.stringify(state.user))
  } else {
    sessionStorage.removeItem('auth_user')
  }
})

export function getRequiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith('/teacher')) {
    return 'teacher'
  }
  if (pathname.startsWith('/student')) {
    return 'student'
  }
  return null
}

export function hasRequiredRole(
  userRole: UserRole,
  requiredRole: UserRole | null,
): boolean {
  if (!requiredRole) {
    return true
  }
  if (userRole === 'admin') {
    return true
  }
  return userRole === requiredRole
}
