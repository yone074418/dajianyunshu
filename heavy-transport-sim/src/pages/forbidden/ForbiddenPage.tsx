import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth/useAuthStore'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const handleGoBack = () => {
    if (user?.role === 'teacher') {
      navigate('/teacher', { replace: true })
    } else if (user?.role === 'student') {
      navigate('/student', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl font-bold text-red-500 mb-4">403</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          无权限访问
        </h1>
        <p className="text-gray-600 mb-2">当前账号无权访问此页面</p>
        <p className="text-sm text-gray-500 mb-6">
          {location.state?.from?.pathname
            ? `您尝试访问的路径：${location.state.from.pathname}`
            : '请确认您的账号角色是否正确'}
        </p>
        <button
          onClick={handleGoBack}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}
