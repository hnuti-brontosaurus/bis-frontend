import { useOutletContext } from 'react-router-dom'
import { PaginatedList } from '../app/services/bis'
import { Event } from '../app/services/testApi'
import { UnscalablePaginatedList } from '../components/PaginatedList'
import EventTable from './EventTable'

const AllEvents = () => {
  const events = useOutletContext<PaginatedList<Event>>()

  return (
    <UnscalablePaginatedList table={EventTable} data={events.results ?? []} />
  )
}

export default AllEvents
