import { useParams } from 'react-router-dom'
import { api } from './app/services/bis'
import Error from './components/Error'
import Loading from './components/Loading'
import EventRegistrationForm from './EventRegistrationForm'

const EventRegistration = () => {
  const params = useParams()
  const eventId = Number(params.eventId)

  const {
    data: event,
    isError: isEventError,
    error: eventError,
  } = api.endpoints.readWebEvent.useQuery({ id: eventId })

  if (isEventError) return <Error error={eventError}></Error>

  if (!event) return <Loading>Připravujeme přihlášku</Loading>

  return (
    <div>
      <h1>Přihláška na akci {event?.name}</h1>
      <div>
        {new Date(event.start).toLocaleDateString('cs')} &ndash;{' '}
        {new Date(event.end).toLocaleDateString('cs')}
      </div>
      <EventRegistrationForm
        onSubmit={data => {
          console.log(data)
        }}
      />
    </div>
  )
}

export default EventRegistration
