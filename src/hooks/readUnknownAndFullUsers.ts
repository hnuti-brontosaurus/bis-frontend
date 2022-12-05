import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'
import { api } from '../app/services/bis'
import { User, UserSearch } from '../app/services/bisTypes'

export const useReadUnknownAndFullUsers = (
  params:
    | {
        id?: string[]
        _search_id?: string[]
        page?: number
        pageSize?: number
        search?: string
      }
    | typeof skipToken,
) => {
  const { data: allUsers, isLoading: isAllUsersLoading } =
    api.endpoints.readAllUsers.useQuery(params)

  const searchIds = useMemo(
    () => allUsers && allUsers.results.map(({ _search_id }) => _search_id),
    [allUsers],
  )

  const { data: fullUsers, isLoading: isFullUsersLoading } =
    api.endpoints.readUsers.useQuery(
      searchIds && searchIds.length > 0 ? { _search_id: searchIds } : skipToken,
    )

  const combinedUsers: (UserSearch | User)[] | undefined =
    allUsers &&
    allUsers.results.map(
      user =>
        (fullUsers &&
          fullUsers.results.find(fu => fu._search_id === user._search_id)) ??
        user,
    )

  return {
    data: combinedUsers,
    isLoading: isAllUsersLoading || isFullUsersLoading,
  }
}
