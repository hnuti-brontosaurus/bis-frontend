import { useOutletContext } from 'react-router-dom'
import { PaginatedList } from '../app/services/bis'
import { Event } from '../app/services/testApi'
import { getEventStatus } from '../utils/helpers'
import { UnscalablePaginatedEventList } from './PaginatedEventList'

const ActiveEvents = () => {
  const events = useOutletContext<PaginatedList<Event>>()

  // here we want to show events that are not older than "next year June"
  const inputEvents = (events.results ?? []).filter(
    event => getEventStatus(event) !== 'closed',
  )

  return <UnscalablePaginatedEventList events={inputEvents} />
}

export default ActiveEvents
