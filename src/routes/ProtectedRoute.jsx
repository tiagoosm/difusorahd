import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from './paths'
import Spinner from '../components/ui/Spinner'

function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to={ROUTES.adminLogin} state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
