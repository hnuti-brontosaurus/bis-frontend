import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from '../app/services/bis'

export const useCurrentUser = () => {
  const { data, ...restWhoami } = api.endpoints.whoami.useQuery()
  const { data: currentUser, ...restUser } = api.endpoints.getUser.useQuery(
    data?.id ?? skipToken,
  )

  return {
    data: currentUser,
    isLoading: restWhoami.isLoading || restUser.isLoading,
  }
}
