import { skipToken } from '@reduxjs/toolkit/dist/query'
import {
  FaPencilAlt,
  FaRegCalendarAlt,
  FaRegCheckCircle,
  FaRegCopy,
  FaTrashAlt,
} from 'react-icons/fa'
import { GrLocation } from 'react-icons/gr'
import { useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import { Button, ButtonLink } from '../components/Button'
import Loading from '../components/Loading'
import { useRemoveEvent } from '../hooks/removeEvent'
import { formatDateRange } from '../utils/helpers'
import styles from './ViewEvent.module.scss'

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
  const { data: location } = api.endpoints.readLocation.useQuery(
    event?.location
      ? {
          id: event.location,
        }
      : skipToken,
  )

  if (isError) return <>Nepodařilo se nám najít akci</>

  if (isEventLoading || !event || !images || !questions)
    return <Loading>Stahujeme akci</Loading>

  if (isEventRemoving) return <Loading>Mažeme akci</Loading>

  const mainImage = [...images.results].sort((a, b) => a.order - b.order)[0]

  return (
    <div>
      <header className={styles.name}>{event.name}</header>
      <nav className={styles.actions}>
        <ButtonLink success to={`/org/akce/${eventId}/upravit`}>
          <FaPencilAlt /> upravit
        </ButtonLink>
        <ButtonLink success to={`/org/akce/${eventId}/uzavrit`}>
          <FaRegCheckCircle /> po akci
        </ButtonLink>
        <ButtonLink success to={`/org/akce/vytvorit?klonovat=${eventId}`}>
          <FaRegCopy /> klonovat
        </ButtonLink>
        <Button danger onClick={() => removeEvent(event)}>
          <FaTrashAlt /> smazat
        </Button>
      </nav>

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
            location?.name
          )}
        </div>
      </div>
      <div>
        <img src={mainImage.image.medium} alt="" />
      </div>
      <pre>{JSON.stringify(event, null, '  ')}</pre>
      <pre>{JSON.stringify(images, null, '  ')}</pre>
      <pre>{JSON.stringify(questions, null, '  ')}</pre>
    </div>
  )
}

export default ViewEvent
