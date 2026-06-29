import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import StudentPage from '../pages/student/StudentPage'
import TeacherPage from '../pages/teacher/TeacherPage'
import LoginPage from '../pages/login/LoginPage'
import NotFoundPage from '../pages/not-found/NotFoundPage'
import ForbiddenPage from '../pages/forbidden/ForbiddenPage'
import SessionExpiredPage from '../pages/session-expired/SessionExpiredPage'
import ExperimentPage from '../pages/experiment/ExperimentPage'
import ScenePreviewPage from '../pages/scene-preview/ScenePreviewPage'
import TaskIntroductionPage from '../pages/task-introduction/TaskIntroductionPage'
import Cargo360Viewer from '../pages/cargo-viewer/Cargo360Viewer'
import LearningCenterPage from '../pages/learning/LearningCenterPage'
import VehicleCombinationPage from '../pages/vehicle-combinations/VehicleCombinationPage'
import TractorComparisonPage from '../pages/tractors/TractorComparisonPage'
import AuthGuard from './AuthGuard'
import RoleGuard from './RoleGuard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/student" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'session-expired',
        element: <SessionExpiredPage />,
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: 'student',
        element: (
          <AuthGuard>
            <RoleGuard>
              <StudentPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/task-introduction',
        element: (
          <AuthGuard>
            <RoleGuard>
              <TaskIntroductionPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/cargo',
        element: (
          <AuthGuard>
            <RoleGuard>
              <Cargo360Viewer />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/learning',
        element: (
          <AuthGuard>
            <RoleGuard>
              <LearningCenterPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/vehicle-combinations',
        element: (
          <AuthGuard>
            <RoleGuard>
              <VehicleCombinationPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/tractors',
        element: (
          <AuthGuard>
            <RoleGuard>
              <TractorComparisonPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/scene-preview',
        element: (
          <AuthGuard>
            <RoleGuard>
              <ScenePreviewPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'student/experiment',
        element: (
          <AuthGuard>
            <RoleGuard>
              <ExperimentPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: 'teacher',
        element: (
          <AuthGuard>
            <RoleGuard>
              <TeacherPage />
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
