import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/auth'
import UnauthenticatedLayout from '../UnauthenticatedLayout'

const UnauthenticatedOutlet = () => {
  const auth = useAuth()
  const [searchParams] = useSearchParams()

  if (auth.user) {
    return <Navigate to={searchParams.get('next') ?? '/'} />
  } else {
    return (
      <UnauthenticatedLayout>
        <Outlet />
      </UnauthenticatedLayout>
    )
  }
}

export default UnauthenticatedOutlet
