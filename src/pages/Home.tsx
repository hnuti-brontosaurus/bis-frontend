import { useCurrentUser } from 'hooks/currentUser'
import { Home as OrgHome } from 'org/pages/Home'
import { isOrganizer } from 'utils/helpers'

export const Home = () => {
  const { data: user } = useCurrentUser()
  if (user && isOrganizer(user)) return <OrgHome />
  else return <div>Home</div>
}
