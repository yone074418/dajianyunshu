import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError, isAuthenticated, user } =
    useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/student'

  if (isAuthenticated && user) {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />
    }
    return <Navigate to="/student" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    await login(email, password)

    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      if (currentUser.role === 'teacher') {
        navigate('/teacher', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          大件运输虚拟仿真实验教学系统
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              邮箱
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入密码"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">测试账号：</p>
          <p className="text-xs text-gray-500">
            学生：student@test.com / password123
          </p>
          <p className="text-xs text-gray-500">
            教师：teacher@test.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}
