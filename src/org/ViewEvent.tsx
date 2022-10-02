import { Link, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'

const ViewEvent = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const { data: event, isLoading: isEventLoading } =
    api.endpoints.readEvent.useQuery({ id: eventId })

  const { data: images, isLoading: isImagesLoading } =
    api.endpoints.readEventImages.useQuery({ eventId })
  const { data: questions, isLoading: isQuestionsLoading } =
    api.endpoints.readEventQuestions.useQuery({ eventId })

  if (isEventLoading || !event || !images || !questions)
    return <>Loading Event</>

  const handleDelete = () => {
    alert('delete not implemented here')
  }

  return (
    <div>
      <header>There is just data of event here...</header>
      <nav>
        <Link to={`/org/akce/${eventId}/upravit`}>upravit</Link>
        <Link to={`/org/akce/vytvorit?klonovat=${eventId}`}>klonovat</Link>
        <button onClick={handleDelete}>smazat</button>
      </nav>
      <pre>{JSON.stringify(event, null, '  ')}</pre>
      <pre>{JSON.stringify(images, null, '  ')}</pre>
      <pre>{JSON.stringify(questions, null, '  ')}</pre>
    </div>
  )
}

export default ViewEvent
