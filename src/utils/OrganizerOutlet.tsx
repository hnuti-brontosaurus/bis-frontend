import { Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks/currentUser'
import { isOrganizer } from './helpers'

const OrganizerOutlet = () => {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) return <div>Loading ...</div>
  if (!user) return <div>This is error, You're a ghost</div>

  return isOrganizer(user) ? <Outlet /> : <div>Nejsi Organizátor/ka</div>
}

export default OrganizerOutlet
