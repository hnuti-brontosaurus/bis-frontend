import { Event } from '../app/services/testApi'
import Pagination from '../components/Pagination'
import { useSearchParamsState } from '../hooks/searchParamsState'
import EventTable from './EventTable'

export const UnscalablePaginatedEventList = ({
  events,
  pageSize = 10,
}: {
  events: Event[]
  pageSize?: number
}) => {
  const [page, setPage] = useSearchParamsState('s', 1, Number)

  const tableEvents = events.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <EventTable events={tableEvents} />
      <Pagination
        page={page}
        pages={Math.ceil((events.length as number) / pageSize)}
        onPageChange={setPage}
      />
    </>
  )
}
