import { Loading } from 'components'
import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { isOrganizer } from 'utils/helpers'
import { useCurrentUser } from '../hooks/currentUser'
import { UnauthenticatedLayout } from './UnauthenticatedLayout'

export const UnauthenticatedOutlet = () => {
  const { data: user, isAuthenticated } = useCurrentUser()
  const [searchParams] = useSearchParams()

  if (user) {
    const redirect =
      searchParams.get('next') ?? (isOrganizer(user) ? '/org' : '/')
    return <Navigate to={redirect} />
  } else if (isAuthenticated) {
    return <Loading>Připravujeme aplikaci</Loading>
  } else {
    return (
      <UnauthenticatedLayout>
        <Outlet />
      </UnauthenticatedLayout>
    )
  }
}
