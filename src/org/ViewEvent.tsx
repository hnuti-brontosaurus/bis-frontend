import { Link, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import { useRemoveEvent } from '../hooks/removeEvent'

const ViewEvent = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const {
    data: event,
    isLoading: isEventLoading,
    isError,
  } = api.endpoints.readEvent.useQuery({ id: eventId })

  const { data: images, isLoading: isImagesLoading } =
    api.endpoints.readEventImages.useQuery({ eventId })
  const { data: questions, isLoading: isQuestionsLoading } =
    api.endpoints.readEventQuestions.useQuery({ eventId })
  const [removeEvent, { isLoading: isEventRemoving }] = useRemoveEvent()

  if (isError) return <>Nepodařilo se nám najít akci</>

  if (isEventLoading || !event || !images || !questions)
    return <>Loading Event</>

  if (isEventRemoving) return <>Mažeme akci</>

  return (
    <div>
      <header>There is just data of event here...</header>
      <nav>
        <Link to={`/org/akce/${eventId}/upravit`}>upravit</Link>
        <Link to={`/org/akce/${eventId}/uzavrit`}>uzavřít</Link>
        <Link to={`/org/akce/vytvorit?klonovat=${eventId}`}>klonovat</Link>
        <button onClick={() => removeEvent(event)}>smazat</button>
      </nav>
      <pre>{JSON.stringify(event, null, '  ')}</pre>
      <pre>{JSON.stringify(images, null, '  ')}</pre>
      <pre>{JSON.stringify(questions, null, '  ')}</pre>
    </div>
  )
}

export default ViewEvent
