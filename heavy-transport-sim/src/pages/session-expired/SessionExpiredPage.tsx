import { useNavigate } from 'react-router-dom'

export default function SessionExpiredPage() {
  const navigate = useNavigate()

  const handleRelogin = () => {
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          会话已失效
        </h1>
        <p className="text-gray-600 mb-6">
          您的登录会话已过期，请重新登录以继续使用
        </p>
        <button
          onClick={handleRelogin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          重新登录
        </button>
      </div>
    </div>
  )
}
