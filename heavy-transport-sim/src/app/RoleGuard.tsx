import { Navigate, useLocation } from 'react-router-dom'
import {
  useAuthStore,
  getRequiredRole,
  hasRequiredRole,
} from '../stores/auth/useAuthStore'

interface RoleGuardProps {
  children: React.ReactNode
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const requiredRole = getRequiredRole(location.pathname)

  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return <Navigate to="/403" state={{ from: location }} replace />
  }

  return <>{children}</>
}
