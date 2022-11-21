import { useParams } from 'react-router-dom'
import { api } from './app/services/bis'
import Error from './components/Error'
import Loading from './components/Loading'
import EventRegistrationForm from './EventRegistrationForm'

const EventRegistration = () => {
  const params = useParams()
  const eventId = Number(params.eventId)

  // fetch event
  const {
    data: event,
    isError: isEventError,
    error: eventError,
  } = api.endpoints.readWebEvent.useQuery({ id: eventId })
  // fetch event questions
  const questions = [
    {
      id: 5,
      question: 'To be or not to be?',
    },
    {
      id: 8,
      question: "What's up?",
    },
    {
      id: 11,
      question: "What's your favourite color?",
    },
  ]

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
        id={String(eventId)}
        questions={questions}
        onSubmit={data => {
          console.log(data, 'submitted')
        }}
      />
    </div>
  )
}

export default EventRegistration
