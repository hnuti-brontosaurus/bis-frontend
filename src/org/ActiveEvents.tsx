import { UnscalablePaginatedList } from 'components'
import { useOutletContext } from 'react-router-dom'
import { PaginatedList } from '../app/services/bis'
import { Event } from '../app/services/bisTypes'
import { useTitle } from '../hooks/title'
import { getEventStatus } from '../utils/helpers'
import EventTable from './EventTable'

const ActiveEvents = () => {
  useTitle('Moje aktuální akce')
  const events = useOutletContext<PaginatedList<Event>>()

  // here we want to show events that are not older than "next year June"
  const inputEvents = (events.results ?? []).filter(
    event => getEventStatus(event) !== 'closed',
  )

  return <UnscalablePaginatedList table={EventTable} data={inputEvents} />
}

export default ActiveEvents
