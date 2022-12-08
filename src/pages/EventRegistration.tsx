import { api, EventApplicationPayload } from 'app/services/bis'
import { Error, Loading } from 'components'
import { useShowApiErrorMessage } from 'features/systemMessage/useSystemMessage'
import { useCurrentUser } from 'hooks/currentUser'
import {
  useClearPersistentForm,
  useDirectPersistForm,
  usePersistentFormData,
} from 'hooks/persistForm'
import { useTitle } from 'hooks/title'
import { useState } from 'react'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { GrLocation } from 'react-icons/gr'
import { useParams } from 'react-router-dom'
import { formatDateRange } from 'utils/helpers'
import styles from './EventRegistration.module.scss'
import EventRegistrationForm, {
  FinishedStep,
  RegistrationFormShapeWithStep,
} from './EventRegistrationForm'

const EventRegistration = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const { data: user, isAuthenticated } = useCurrentUser()

  // fetch event
  const {
    data: event,
    isError: isEventError,
    error: eventError,
  } = api.endpoints.readWebEvent.useQuery({ id: eventId })

  useTitle(`Přihláška na akci ${event?.name ?? ''}`)

  const [createEventApplication, { error: savingError }] =
    api.endpoints.createEventApplication.useMutation()

  const formData = usePersistentFormData(
    'registration',
    String(eventId),
  ) as RegistrationFormShapeWithStep
  const persist = useDirectPersistForm('registration', String(eventId))
  const clearPersistentData = useClearPersistentForm(
    'registration',
    String(eventId),
  )

  useShowApiErrorMessage(
    savingError,
    'Nepodařilo se nám uložit přihlášku. Zkuste to znovu.',
  )

  const [isSaving, setIsSaving] = useState(false)

  if (isEventError) return <Error error={eventError}></Error>

  if (isSaving) return <Loading>Ukládáme přihlášku</Loading>

  if (isAuthenticated && !user) return <Loading>Ověřujeme uživatele</Loading>

  if (!event) return <Loading>Připravujeme přihlášku</Loading>

  if (!event.registration) return <>Není zadefinována registrace.</>

  if (event.registration.is_event_full)
    return <>Tato akce je plná. Zkuste jinou z našich akcí.</>

  if (!event.registration.is_registration_required)
    return <>Na tuto akci se nemusíte přihlašovat. Stačí přijít.</>

  const handleRestart = () => {
    clearPersistentData()
  }

  const handleFinish = () => {
    clearPersistentData()
    // when finished, go to main brontosaurus site
    globalThis.location.href = 'https://brontosaurus.cz'
  }

  const handleSubmit = async (data: EventApplicationPayload) => {
    try {
      setIsSaving(true)
      await createEventApplication({
        application: data,
        eventId,
      }).unwrap()
      clearPersistentData()
      persist({ step: 'finished' })
    } catch (error) {
      persist({ step: 'progress' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // redirect to event detail on brontosaurus.cz
    // TODO set a more generic address (not always dobrovolnicke-akce)
    globalThis.location.href = `https://brontosaurus.cz/dobrovolnicke-akce/detail/${eventId}/`
  }

  return (
    <div>
      <h1 className={styles.header}>Přihláška na akci {event?.name}</h1>
      <div className={styles.infoBox}>
        <div>
          <FaRegCalendarAlt /> {formatDateRange(event.start, event.end)}
        </div>
        <div>
          <GrLocation /> {event.location?.name}
        </div>
      </div>
      {formData?.step === 'finished' ? (
        <FinishedStep
          message={
            event.registration.questionnaire?.after_submit_text ||
            'Děkujeme za přihlášku!'
          }
          onRestart={handleRestart}
          onFinish={handleFinish}
        />
      ) : (
        <EventRegistrationForm
          id={String(eventId)}
          user={user}
          questionnaire={event.registration.questionnaire ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default EventRegistration
