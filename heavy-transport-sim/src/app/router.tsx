import {
  createBrowserRouter,
  redirect,
  type RouteObject,
} from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import StudentPage from '../pages/student/StudentPage'
import TeacherPage from '../pages/teacher/TeacherPage'
import LoginPage from '../pages/login/LoginPage'
import NotFoundPage from '../pages/not-found/NotFoundPage'
import {
  getCurrentProfile,
  getRoleHomePath,
  type UserRole,
} from '../features/auth/authSession'

async function rootLoader() {
  const profile = await getCurrentProfile()

  if (!profile) {
    throw redirect('/login')
  }

  throw redirect(getRoleHomePath(profile.role))
}

async function loginLoader() {
  const profile = await getCurrentProfile()

  if (!profile) {
    return null
  }

  const homePath = getRoleHomePath(profile.role)

  if (homePath !== '/login') {
    throw redirect(homePath)
  }

  return null
}

function protectedRoleLoader(expectedRole: UserRole) {
  return async () => {
    const profile = await getCurrentProfile()

    if (!profile) {
      throw redirect('/login')
    }

    if (profile.role !== expectedRole) {
      throw redirect(getRoleHomePath(profile.role))
    }

    return profile
  }
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        loader: rootLoader,
      },
      {
        path: 'student',
        element: <StudentPage />,
        loader: protectedRoleLoader('student'),
      },
      {
        path: 'teacher',
        element: <TeacherPage />,
        loader: protectedRoleLoader('teacher'),
      },
      {
        path: 'login',
        element: <LoginPage />,
        loader: loginLoader,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
