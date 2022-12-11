import { PaginatedList } from 'app/services/bis'
import { Event } from 'app/services/bisTypes'
import { UnscalablePaginatedList } from 'components'
import { useTitle } from 'hooks/title'
import { EventTable } from 'org/EventTable'
import { useOutletContext } from 'react-router-dom'

export const AllEvents = () => {
  useTitle('Moje akce')
  const events = useOutletContext<PaginatedList<Event>>()

  return (
    <UnscalablePaginatedList table={EventTable} data={events.results ?? []} />
  )
}
