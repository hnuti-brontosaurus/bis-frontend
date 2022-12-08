import { PaginatedList } from 'app/services/bis'
import { Event } from 'app/services/bisTypes'
import { UnscalablePaginatedList } from 'components'
import { useTitle } from 'hooks/title'
import { useOutletContext } from 'react-router-dom'
import EventTable from '../EventTable'

const AllEvents = () => {
  useTitle('Moje akce')
  const events = useOutletContext<PaginatedList<Event>>()

  return (
    <UnscalablePaginatedList table={EventTable} data={events.results ?? []} />
  )
}

export default AllEvents
