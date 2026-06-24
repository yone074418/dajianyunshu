import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div>
      <h1>页面未找到</h1>
      <p>您访问的页面不存在</p>
      <Link to="/student">返回学生端</Link>
    </div>
  )
}
