import { useCurrentUser } from 'hooks/currentUser'
import { Home as OrgHome } from 'org/pages/Home'
import { Home as UserHome } from 'user/pages/Home'
import { isOrganizer } from 'utils/helpers'

export const Home = () => {
  const { data: user } = useCurrentUser()
  return user && isOrganizer(user) ? <OrgHome /> : <UserHome />
}
