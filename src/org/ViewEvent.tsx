import { skipToken } from '@reduxjs/toolkit/dist/query'
import { sanitize } from 'dompurify'
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
import { Actions } from '../components/FormLayout'
import Loading from '../components/Loading'
import { useRemoveEvent } from '../hooks/removeEvent'
import { formatDateRange, formatDateTime } from '../utils/helpers'
import styles from './ViewEvent.module.scss'

const ViewEvent = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const {
    data: event,
    isLoading: isEventLoading,
    isError,
  } = api.endpoints.readEvent.useQuery({ id: eventId })
  const { data: contactPerson } = api.endpoints.getUser.useQuery(
    event?.propagation ? { id: event.propagation.contact_person } : skipToken,
  )
  const { data: images } = api.endpoints.readEventImages.useQuery({ eventId })
  const { data: questions } = api.endpoints.readEventQuestions.useQuery({
    eventId,
  })
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

  const [mainImage, ...otherImages] = [...images.results].sort(
    (a, b) => a.order - b.order,
  )

  return (
    <div className={styles.wrapper}>
      <header className={styles.name}>{event.name}</header>
      <Actions>
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
      </Actions>

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
      <div className={styles.infoBoxDetail}>
        <div className={styles.imageWrapper}>
          <img className={styles.image} src={mainImage.image.medium} alt="" />
          <div className={styles.tags}>
            <div className={styles.tag}>{event.program.name}</div>
            <div className={styles.tag}>{event.group.name}</div>
          </div>
        </div>
        <table>
          <tbody>
            <tr>
              <th>Datum</th>
              <td>{formatDateRange(event.start, event.end)}</td>
            </tr>
            <tr>
              <th>Místo</th>
              <td>
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
              </td>
            </tr>
            <tr>
              <th>Věk</th>
              <td>
                {event.propagation?.minimum_age ?? '?'} -{' '}
                {event.propagation?.maximum_age ?? '?'} let
              </td>
            </tr>
            <tr>
              <th>Začátek akce</th>
              <td>
                {formatDateTime(event.start, event.start_time ?? undefined)}
              </td>
            </tr>
            <tr>
              <th>Cena</th>
              <td>{event.propagation?.cost} Kč</td>
            </tr>
            <tr>
              <th>Kontaktní osoba</th>
              <td>
                <div>
                  {event.propagation?.contact_name ||
                    contactPerson?.display_name}
                </div>
                <div>
                  {event.propagation?.contact_phone || contactPerson?.phone}
                </div>
                <div>
                  {event.propagation?.contact_email || contactPerson?.email}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={styles.invitationTexts}>
        <header>Co na nás čeká</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(
              event.propagation?.invitation_text_introduction ?? '',
            ),
          }}
        />
        <header>Co, kde a jak</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(
              event.propagation?.invitation_text_practical_information ?? '',
            ),
          }}
        />
        <header>Dobrovolnická pomoc</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(
              event.propagation?.invitation_text_work_description ?? '',
            ),
          }}
        />
        <header>Malá ochutnávka</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(event.propagation?.invitation_text_about_us ?? ''),
          }}
        />
        <div className={styles.imageList}>
          {otherImages.map(img => (
            <img
              className={styles.image}
              key={img.id}
              src={img.image.medium}
              alt=""
            />
          ))}
        </div>
      </div>
      <pre className={styles.data}>{JSON.stringify(event, null, '  ')}</pre>
      <pre className={styles.data}>{JSON.stringify(images, null, '  ')}</pre>
      <pre className={styles.data}>{JSON.stringify(questions, null, '  ')}</pre>
    </div>
  )
}

export default ViewEvent
