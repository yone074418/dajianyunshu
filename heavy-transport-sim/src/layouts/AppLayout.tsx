import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth/useAuthStore'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              <Link to="/">大件运输虚拟仿真实验教学系统</Link>
            </h1>

            <nav className="flex items-center gap-4">
              {!isAuthenticated && !isLoginPage && (
                <Link
                  to="/login"
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  登录
                </Link>
              )}

              {isAuthenticated && user && (
                <>
                  {user.role === 'student' && (
                    <Link
                      to="/student"
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      学生端
                    </Link>
                  )}
                  {user.role === 'teacher' && (
                    <Link
                      to="/teacher"
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      教师端
                    </Link>
                  )}
                  <span className="text-sm text-gray-600">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    退出登录
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
