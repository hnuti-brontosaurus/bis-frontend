import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AuthenticatedLayout from '../AuthenticatedLayout'
import { useCurrentUser } from '../hooks/currentUser'

const AuthenticatedOutlet = () => {
  const { isAuthenticated, isLoading, data } = useCurrentUser()
  const location = useLocation()

  if (isAuthenticated) {
    return (
      <AuthenticatedLayout>
        <Outlet />
      </AuthenticatedLayout>
    )
  } else {
    // next location will be the current, or empty
    const next = ['', '/'].includes(location.pathname)
      ? ''
      : `?next=${encodeURIComponent(location.pathname)}`
    return <Navigate to={`/login${next}`} />
  }
}

export default AuthenticatedOutlet
