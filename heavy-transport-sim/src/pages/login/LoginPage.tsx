import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getRoleHomePath,
  signInWithEmailPassword,
} from '../../features/auth/authSession'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await signInWithEmailPassword(email, password)

    setIsSubmitting(false)

    if (result.error || !result.profile) {
      setError(result.error || '登录失败，请重新输入。')
      return
    }

    const homePath = getRoleHomePath(result.profile.role)

    if (homePath === '/login') {
      setError('管理员后台暂未实现，请使用学生或教师账号登录。')
      return
    }

    navigate(homePath, { replace: true })
  }

  return (
    <div>
      <h1>登录</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}
