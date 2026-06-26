import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth/useAuthStore'

export default function TeacherPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">教师端</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              欢迎，{user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-600"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">教师首页</h2>
          <p className="text-gray-600">功能将在后续任务实现</p>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">
              当前角色：
              {user?.role === 'student'
                ? '学生'
                : user?.role === 'teacher'
                  ? '教师'
                  : '未知'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
