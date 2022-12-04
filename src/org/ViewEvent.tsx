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
import { Button, ButtonLink } from '../components/Button'
import Error from '../components/Error'
import { Actions } from '../components/FormLayout'
import Loading from '../components/Loading'
import { useReadFullEvent } from '../hooks/readFullEvent'
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
    error: readEventError,
  } = useReadFullEvent(eventId)

  const [removeEvent, { isLoading: isEventRemoving }] = useRemoveEvent()

  if (isError)
    return <Error error={readEventError}>Nepodařilo se nám najít akci</Error>

  if (isEventLoading || !event) return <Loading>Stahujeme akci</Loading>

  if (isEventRemoving) return <Loading>Mažeme akci</Loading>

  const [mainImage, ...otherImages] = [...event.images].sort(
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
          <GrLocation /> {event.location?.name}
        </div>
      </div>
      <div className={styles.infoBoxDetail}>
        <div className={styles.imageWrapper}>
          {mainImage ? (
            <img className={styles.image} src={mainImage.image.medium} alt="" />
          ) : (
            <div className={styles.imageMissing}>
              Obrázek chybí
              <ButtonLink to="upravit?krok=7">Přidat</ButtonLink>
            </div>
          )}
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
              <td>{event.location?.name}</td>
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
                    event.propagation?.contact_person?.display_name}
                </div>
                <div>
                  {event.propagation?.contact_phone ||
                    event.propagation?.contact_person?.phone}
                </div>
                <div>
                  {event.propagation?.contact_email ||
                    event.propagation?.contact_person?.email}
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
    </div>
  )
}

export default ViewEvent
