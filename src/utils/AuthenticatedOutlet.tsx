import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import AuthenticatedLayout from '../AuthenticatedLayout'
import Loading from '../components/Loading'
import { selectLoggingOut } from '../features/auth/authSlice'
import { useCurrentUser } from '../hooks/currentUser'

const AuthenticatedOutlet = () => {
  const { isAuthenticated, data: user } = useCurrentUser()
  const location = useLocation()

  const isLoggingOut = useAppSelector(selectLoggingOut)

  if (isAuthenticated) {
    return (
      <AuthenticatedLayout>
        {user ? (
          isLoggingOut ? (
            <Loading hideHeader>Probíhá odhlašování...</Loading>
          ) : (
            <Outlet />
          )
        ) : (
          <Loading>Ověřujeme uživatele</Loading>
        )}
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
