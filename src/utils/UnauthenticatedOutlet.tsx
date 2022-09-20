import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/auth'
import UnauthenticatedLayout from '../UnauthenticatedLayout'

const UnauthenticatedOutlet = () => {
  const auth = useAuth()

  return auth.user ? (
    <Navigate to="/" />
  ) : (
    <UnauthenticatedLayout>
      <Outlet />
    </UnauthenticatedLayout>
  )
}

export default UnauthenticatedOutlet
