import { useCurrentUser } from './hooks/currentUser'
import OrgHome from './org/Home'
import { isOrganizer } from './utils/helpers'

const Home = () => {
  const { data: user } = useCurrentUser()
  if (user && isOrganizer(user)) return <OrgHome />
  else return <div>Home</div>
}

export default Home
