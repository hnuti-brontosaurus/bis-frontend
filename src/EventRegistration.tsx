import { FaRegCalendarAlt } from 'react-icons/fa'
import { GrLocation } from 'react-icons/gr'
import { useParams } from 'react-router-dom'
import { api } from './app/services/bis'
import Error from './components/Error'
import Loading from './components/Loading'
import styles from './EventRegistration.module.scss'
import EventRegistrationForm from './EventRegistrationForm'
import { useTitle } from './hooks/title'
import { formatDateRange } from './utils/helpers'

const EventRegistration = () => {
  const params = useParams()
  const eventId = Number(params.eventId)

  // fetch event
  const {
    data: event,
    isError: isEventError,
    error: eventError,
  } = api.endpoints.readWebEvent.useQuery({ id: eventId })

  useTitle(`Přihláška na akci ${event?.name ?? ''}`)

  const [createEventApplication, { isLoading }] =
    api.endpoints.createEventApplication.useMutation()

  if (isEventError) return <Error error={eventError}></Error>

  if (isLoading) return <Loading>Ukládáme přihlášku</Loading>

  if (!event) return <Loading>Připravujeme přihlášku</Loading>

  if (!event.registration) return <>Není zadefinována registrace.</>

  if (event.registration.is_event_full)
    return <>Tato akce je plná. Zkuste jinou z našich akcí.</>

  if (!event.registration.is_registration_required)
    return <>Na tuto akci se nemusíte přihlašovat. Stačí přijít.</>

  return (
    <div>
      <h1 className={styles.header}>Přihláška na akci {event?.name}</h1>
      <div className={styles.infoBox}>
        <div>
          <FaRegCalendarAlt /> {formatDateRange(event.start, event.end)}
        </div>
        <div>
          <GrLocation />{' '}
          {event.online_link ? (
            <a
              href={event.online_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              online
            </a>
          ) : (
            event.location?.name
          )}
        </div>
      </div>
      <EventRegistrationForm
        id={String(eventId)}
        questionnaire={event.registration.questionnaire ?? undefined}
        onSubmit={async data => {
          await createEventApplication({
            application: data,
            eventId,
          }).unwrap()
        }}
        onFinish={() => {
          // when finished, go to main brontosaurus site
          globalThis.location.href = 'https://brontosaurus.cz'
        }}
        onCancel={() => {
          // redirect back to previous page
          globalThis.history.back()
        }}
      />
    </div>
  )
}

export default EventRegistration
