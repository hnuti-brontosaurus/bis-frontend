import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AuthenticatedLayout from '../AuthenticatedLayout'
import { useAuth } from '../hooks/auth'

const AuthenticatedOutlet = () => {
  const auth = useAuth()
  const location = useLocation()

  return auth.user ? (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  )
}

export default AuthenticatedOutlet
