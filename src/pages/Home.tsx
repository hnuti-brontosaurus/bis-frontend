import { useCurrentUser } from 'hooks/currentUser'
import { useCurrentRole } from 'hooks/useCurrentRole'
import { Home as OrgHome } from 'org/pages/Home'
import { Home as UserHome } from 'user/pages/Home'

export const Home = () => {
  const { data: user } = useCurrentUser()
  const [role] = useCurrentRole()
  if (!user) return null
  return role === 'organizer' ? (
    <OrgHome />
  ) : role === 'user' ? (
    <UserHome />
  ) : null
}
