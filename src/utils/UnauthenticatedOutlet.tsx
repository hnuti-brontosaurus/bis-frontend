import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useCurrentUser } from '../hooks/currentUser'
import UnauthenticatedLayout from '../UnauthenticatedLayout'
import { isOrganizer } from './helpers'

const UnauthenticatedOutlet = () => {
  const { data: user, isLoading, isAuthenticated } = useCurrentUser()
  const [searchParams] = useSearchParams()

  if (user) {
    return (
      <Navigate
        to={searchParams.get('next') ?? isOrganizer(user) ? '/org' : '/'}
      />
    )
  } else if (isAuthenticated) {
    return <>initializing</>
  } else {
    return (
      <UnauthenticatedLayout>
        <Outlet />
      </UnauthenticatedLayout>
    )
  }
}

export default UnauthenticatedOutlet
