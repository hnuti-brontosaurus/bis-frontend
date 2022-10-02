import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from '../app/services/bis'
import Pagination from '../components/Pagination'
import { useCurrentUser } from '../hooks/currentUser'
import { useSearchParamsState } from '../hooks/searchParamsState'
import EventTable from './EventTable'

const pageSize = 5

const AllEvents = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()

  const [page, setPage] = useSearchParamsState('s', 1, Number)

  const { data: events, isLoading: isEventsLoading } =
    api.endpoints.readOrganizedEvents.useQuery(
      currentUser ? { userId: currentUser.id, page, pageSize: 5 } : skipToken,
    )

  if (isEventsLoading || !events?.results) return <div>Loading...</div>

  return (
    <>
      <EventTable events={events.results} />
      <Pagination
        page={page}
        pages={Math.ceil((events.count as number) / pageSize)}
        onPageChange={setPage}
      />
    </>
  )
}

export default AllEvents
