import { useNavigate } from 'react-router-dom'
import { signOutSession } from '../../features/auth/authSession'

export default function StudentPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOutSession()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <h1>学生端</h1>
      <p>已登录学生会话。</p>
      <button type="button" onClick={handleLogout}>
        退出登录
      </button>
    </div>
  )
}
