import { Link, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <header>
        <h1>大件运输虚拟仿真实验教学系统</h1>
        <nav>
          <Link to="/student">学生端</Link>
          <Link to="/teacher">教师端</Link>
          <Link to="/login">登录</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
