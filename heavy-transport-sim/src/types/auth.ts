export type UserRole = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions
