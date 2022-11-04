import { Outlet } from 'react-router-dom'
import Loading from '../components/Loading'
import { useCurrentUser } from '../hooks/currentUser'
import { isOrganizer } from './helpers'

const OrganizerOutlet = () => {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) return <Loading>Ověřujeme Tvé role</Loading>
  if (!user) return <div>This is error, You're a ghost</div>

  return isOrganizer(user) ? <Outlet /> : <div>Nejsi Organizátor/ka</div>
}

export default OrganizerOutlet
