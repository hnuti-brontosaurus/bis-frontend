import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AuthenticatedLayout from '../AuthenticatedLayout'
import { useAuth } from '../hooks/auth'

const AuthenticatedOutlet = () => {
  const auth = useAuth()
  const location = useLocation()

  if (auth.user) {
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
