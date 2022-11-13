import { sanitize } from 'dompurify'
import { CorrectEventPropagationImage } from '../app/services/bis'
import { Event } from '../app/services/testApi'
import styles from './ViewEventWeb.module.scss'

const ViewEventWeb = ({
  event,
  images,
}: {
  event: Event
  images: CorrectEventPropagationImage[]
}) => {
  const [mainImage] = [...images].sort((a, b) => a.order - b.order)
  return (
    <div className={styles['events-event-wrapper']}>
      <a className={styles['events-event']} href="detail/14582">
        <div className={styles['events-event-image-wrapper']}>
          <img
            alt=""
            className={styles['events-event-image']}
            src={mainImage?.image?.medium}
          />
          <noscript>
            <img
              alt=""
              src={mainImage?.image?.medium}
              className={styles['events-event-image']}
            />
          </noscript>

          <div className={styles['events-event-meta'] + ' eventTagList'}>
            <div className="eventTagList__item">{event.group.name}</div>
          </div>
        </div>

        <header className={styles['events-event-header']}>
          <h4 className={styles['events-event-header-heading']}>
            {event.name}
          </h4>

          <div className={styles['events-event-header-meta']}>
            <time
              className={styles['events-event-header-meta-datetime']}
              dateTime={event.start}
            >
              {event.start} - {event.end}
            </time>

            <span
              className={styles['events-event-header-meta-place']}
              title="Místo konání"
            >
              {event.location}
            </span>
          </div>
        </header>

        <p
          className={styles['events-event-excerpt']}
          dangerouslySetInnerHTML={{
            __html: sanitize(
              event.propagation?.invitation_text_introduction ?? '',
            ),
          }}
        ></p>
      </a>
    </div>
  )
}

export default ViewEventWeb
