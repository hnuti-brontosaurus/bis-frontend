import { useOutletContext } from 'react-router-dom'
import { PaginatedList } from '../app/services/bis'
import { Event } from '../app/services/testApi'
import { UnscalablePaginatedList } from '../components/PaginatedList'
import { useTitle } from '../hooks/title'
import { getEventStatus } from '../utils/helpers'
import EventTable from './EventTable'

const UnfinishedEvents = () => {
  useTitle('Moje nevyplněné akce')
  const events = useOutletContext<PaginatedList<Event>>()

  // here we want events that haven't been finished, and are not drafts
  // TODO we'll need info from api what's draft and what's done
  // for now we just show the events without record

  const inputEvents = (events.results ?? []).filter(
    event => getEventStatus(event) === 'inProgress',
  )

  return <UnscalablePaginatedList table={EventTable} data={inputEvents} />
}

export default UnfinishedEvents
