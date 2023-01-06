import { useLogout } from 'hooks/useLogout'
import { useEffect } from 'react'

export const Logout = () => {
  const logout = useLogout()

  useEffect(() => {
    logout()
  }, [logout])

  return null
}
