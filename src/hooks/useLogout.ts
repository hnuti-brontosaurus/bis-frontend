import { api } from 'app/services/bis'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useLogout = () => {
  const [logout] = api.endpoints.logout.useMutation()

  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    // logout with endpoint
    await logout().unwrap()
    // remove auth token from local storage and state
    // this is taken care of in src/app/store

    // go to homepage
    navigate('/')
    // and hard redirect to cleanup the state and whatnot
    // globalThis.location.href = '/'
  }, [logout, navigate])

  return handleLogout
}
