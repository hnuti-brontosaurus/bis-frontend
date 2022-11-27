import Header from './Header'
import { useCurrentUser } from './hooks/currentUser'

const MixedHeader = () => {
  const { isAuthenticated } = useCurrentUser()
  return <Header></Header>
}

export default MixedHeader
