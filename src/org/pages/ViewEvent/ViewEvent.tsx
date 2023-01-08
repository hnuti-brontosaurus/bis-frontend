import {
  Actions,
  Breadcrumbs,
  Button,
  ButtonLink,
  DataView,
  Loading,
} from 'components'
import * as combinedTranslations from 'config/static/combinedTranslations'
import { sanitize } from 'dompurify'
import type { FullEvent } from 'hooks/readFullEvent'
import { useRemoveEvent } from 'hooks/removeEvent'
import { useTitle } from 'hooks/title'
import { useAllowedToCreateEvent } from 'hooks/useAllowedToCreateEvent'
import { useCancelEvent, useRestoreCanceledEvent } from 'hooks/useCancelEvent'
import { AiOutlineStop } from 'react-icons/ai'
import {
  FaPencilAlt,
  FaRedo,
  FaRegCalendarAlt,
  FaRegCheckCircle,
  FaRegCopy,
  FaTrashAlt,
} from 'react-icons/fa'
import { GrLocation } from 'react-icons/gr'
import { useOutletContext, useParams } from 'react-router-dom'
import { formatDateRange, formatDateTime, sortOrder } from 'utils/helpers'
import styles from './ViewEvent.module.scss'

export const ViewEvent = ({ readonly }: { readonly?: boolean }) => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const { event } = useOutletContext<{ event: FullEvent }>()
  const [canAddEvent] = useAllowedToCreateEvent()

  useTitle(`Akce ${event?.name ?? ''}`)

  const [removeEvent, { isLoading: isEventRemoving }] = useRemoveEvent()

  const [cancelEvent, { isLoading: isEventCanceling }] = useCancelEvent()
  const [restoreCanceledEvent, { isLoading: isEventRestoring }] =
    useRestoreCanceledEvent()

  if (isEventRemoving) return <Loading>Mažeme akci</Loading>

  if (isEventCanceling) return <Loading>Rušíme akci</Loading>

  if (isEventRestoring) return <Loading>Obnovujeme akci</Loading>

  const [mainImage, ...otherImages] = [...event.images].sort(sortOrder)

  return (
    <>
      <Breadcrumbs eventName={event && event.name} />
      <div className={styles.wrapper}>
        <header className={styles.name}>{event.name}</header>
        {event.is_canceled && <div>(Akce je zrušena)</div>}
        <div className={styles.infoBox}>
          <div>
            <FaRegCalendarAlt /> {formatDateRange(event.start, event.end)}
          </div>
          <div>
            <GrLocation /> {event.location?.name}
          </div>
        </div>
        {!readonly && (
          <Actions>
            <ButtonLink secondary to={`/org/akce/${eventId}/upravit`}>
              <FaPencilAlt /> upravit
            </ButtonLink>
            <ButtonLink secondary to={`/org/akce/${eventId}/uzavrit`}>
              <FaRegCheckCircle /> po akci
            </ButtonLink>
            {canAddEvent && (
              <ButtonLink
                secondary
                to={`/org/akce/vytvorit?klonovat=${eventId}`}
              >
                <FaRegCopy /> klonovat
              </ButtonLink>
            )}
            {event.is_canceled ? (
              <Button secondary onClick={() => restoreCanceledEvent(event)}>
                <FaRedo /> obnovit
              </Button>
            ) : (
              <Button danger onClick={() => cancelEvent(event)}>
                <AiOutlineStop /> zrušit
              </Button>
            )}
            <Button danger onClick={() => removeEvent(event)}>
              <FaTrashAlt /> smazat
            </Button>
          </Actions>
        )}

        <div className={styles.infoBoxDetail}>
          <div className={styles.imageWrapper}>
            {mainImage ? (
              <img
                className={styles.image}
                src={mainImage.image.medium}
                alt=""
              />
            ) : (
              <div className={styles.imageMissing}>
                Obrázek chybí
                {readonly ? null : (
                  <ButtonLink to="upravit?krok=7">Přidat</ButtonLink>
                )}
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
              __html: sanitize(
                event.propagation?.invitation_text_about_us ?? '',
              ),
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
        {/* <pre className={styles.data}>{JSON.stringify(event, null, 2)}</pre> */}
        <h2>Data</h2>
        <DataView
          data={event}
          translations={combinedTranslations.event}
          genericTranslations={combinedTranslations.generic}
        />
      </div>
    </>
  )
}
