import { Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks/currentUser'

const OrganizerOutlet = () => {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) return <div>Loading ...</div>
  if (!user) return <div>This is error, You're a ghost</div>

  return user.roles.find(role => ['organizer', 'admin'].includes(role.slug)) ? (
    <Outlet />
  ) : (
    <div>Nejsi Organizátor/ka</div>
  )
}

export default OrganizerOutlet
