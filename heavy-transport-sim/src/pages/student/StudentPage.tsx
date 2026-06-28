import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth/useAuthStore'

export default function StudentPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const entryCards = [
    {
      title: '任务介绍',
      description: '查看运输任务、货物参数、起终点和六阶段流程。',
      path: '/student/task-introduction',
    },
    {
      title: '货物查看',
      description: '旋转查看大型变压器模型和长宽高重量参数。',
      path: '/student/cargo',
    },
    {
      title: '知识学习',
      description: '学习车辆、路线、装车、绑扎和安全知识并保存进度。',
      path: '/student/learning',
    },
    {
      title: '车辆组合',
      description: '查看全挂、半挂和自行式轴线车组合数据。',
      path: '/student/vehicle-combinations',
    },
    {
      title: '继续实验',
      description: '恢复当前阶段，查看步骤提示并保存实验进度。',
      path: '/student/experiment',
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">学生端</h1>
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
          <h2 className="text-lg font-medium text-gray-800 mb-4">学生首页</h2>
          <p className="text-gray-600">
            按实验流程进入任务介绍、货物查看、知识学习、车辆组合和实验操作。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {entryCards.map((card) => (
              <button
                key={card.path}
                type="button"
                onClick={() => navigate(card.path)}
                className="text-left border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-800">{card.title}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {card.description}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">
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
