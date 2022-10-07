import { useSelector } from 'react-redux'
import { selectAuthenticated } from '../features/auth/authSlice'

export const useAuth = () => {
  const isAuthenticated = useSelector(selectAuthenticated)

  return isAuthenticated
}
