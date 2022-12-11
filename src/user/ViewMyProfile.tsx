import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks/currentUser'

export const ViewMyProfile = () => {
  const { data: currentUser } = useCurrentUser()

  // only use this component when current user is already resolved in parent component
  return <Navigate to={`/profil/${currentUser!.id}`} />
}
