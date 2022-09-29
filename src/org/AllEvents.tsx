import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'

const AllEvents = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()

  const { data: events, isLoading: isEventsLoading } =
    api.endpoints.readOrganizedEvents.useQuery(
      currentUser ? { userId: currentUser.id } : skipToken,
    )

  return <pre>{JSON.stringify(events?.results)}</pre>
}

export default AllEvents
