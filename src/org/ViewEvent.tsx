import classNames from 'classnames'
import { Link, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import Loading from '../components/Loading'
import formStyles from '../Form.module.scss'
import { useRemoveEvent } from '../hooks/removeEvent'
import ViewEventWeb from './ViewEventWeb'

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
    return <Loading>Stahujeme akci</Loading>

  if (isEventRemoving) return <Loading>Mažeme akci</Loading>

  return (
    <div>
      <ViewEventWeb event={event} images={images.results} />
      <header>
        <h1>
          Akce <i>{event.name}</i>
        </h1>
      </header>
      <nav>
        <Link
          className={classNames(
            formStyles.actionButton,
            formStyles.mainActionButton,
          )}
          to={`/org/akce/${eventId}/upravit`}
        >
          upravit
        </Link>
        <Link
          className={classNames(
            formStyles.actionButton,
            formStyles.mainActionButton,
          )}
          to={`/org/akce/${eventId}/uzavrit`}
        >
          uzavřít
        </Link>
        <Link
          className={classNames(
            formStyles.actionButton,
            formStyles.mainActionButton,
          )}
          to={`/org/akce/vytvorit?klonovat=${eventId}`}
        >
          klonovat
        </Link>
        <button
          className={classNames(formStyles.dangerActionButton)}
          onClick={() => removeEvent(event)}
        >
          smazat
        </button>
      </nav>
      <pre>{JSON.stringify(event, null, '  ')}</pre>
      <pre>{JSON.stringify(images, null, '  ')}</pre>
      <pre>{JSON.stringify(questions, null, '  ')}</pre>
    </div>
  )
}

export default ViewEvent
