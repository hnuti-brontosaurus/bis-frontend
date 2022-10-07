import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from '../app/services/bis'
import { useAuth } from './auth'

export const useCurrentUser = () => {
  const auth = useAuth()

  const { data, ...restWhoami } = api.endpoints.whoami.useQuery(
    auth ? undefined : skipToken,
  )
  const { data: currentUser, ...restUser } = api.endpoints.getUser.useQuery(
    data?.id ? { id: data.id } : skipToken,
  )

  return {
    data: currentUser,
    isLoading: restWhoami.isLoading || restUser.isLoading,
    isAuthenticated: auth,
  }
}
