import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/auth'
import UnauthenticatedLayout from '../UnauthenticatedLayout'

export const UnauthenticatedOutlet = () => {
  const auth = useAuth()

  return auth.user ? (
    <Navigate to="/" />
  ) : (
    <UnauthenticatedLayout>
      <Outlet />
    </UnauthenticatedLayout>
  )
}
