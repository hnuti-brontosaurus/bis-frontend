import { api } from 'app/services/bis'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useLogout = () => {
  const [logout] = api.endpoints.logout.useMutation()

  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    try {
      // logout with endpoint
      await logout().unwrap()
      // remove auth token from local storage and state
      // this is taken care of in src/app/store
    } catch (e) {
      // catch api errors, but continue to sign out anyways
      // api failure should not block user's ability to sign out from frontend
    } finally {
      // go to homepage
      navigate('/')
      // and hard redirect to cleanup the state and whatnot
      // globalThis.location.href = '/'
    }
  }, [logout, navigate])

  return handleLogout
}
