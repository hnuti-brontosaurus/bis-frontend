import Header from './Header'
import { useCurrentUser } from './hooks/currentUser'

const MixedHeader = () => {
  const { isAuthenticated } = useCurrentUser()
  // TODO add a header for when the person is not signed in
  return <Header></Header>
}

export default MixedHeader
