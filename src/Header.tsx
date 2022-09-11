import { useCurrentUser } from './hooks/currentUser'

const Header = () => {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) return <div>loading...</div>

  return <pre>{JSON.stringify(user, null, 2)}</pre>
}

export default Header
