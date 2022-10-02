import { useOutletContext } from 'react-router-dom'
import { PaginatedList } from '../app/services/bis'
import { Event } from '../app/services/testApi'
import { UnscalablePaginatedEventList } from './PaginatedEventList'

const AllEvents = () => {
  const events = useOutletContext<PaginatedList<Event>>()

  return <UnscalablePaginatedEventList events={events.results ?? []} />
}

export default AllEvents
