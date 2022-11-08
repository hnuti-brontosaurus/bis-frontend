import { skipToken } from '@reduxjs/toolkit/dist/query'
import merge from 'lodash/merge'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, CorrectEventPropagationImage } from '../app/services/bis'
import Loading from '../components/Loading'
import { useCreateOrSelectLocation } from '../components/SelectLocation'
import { useShowMessage } from '../features/systemMessage/useSystemMessage'
import { useBase64Images } from '../hooks/base64Images'
import { event2payload } from './EditEvent'
import EventForm, { EventFormShape } from './EventForm'

const CreateEvent = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const cloneEventId = Number(searchParams.get('klonovat'))

  const showMessage = useShowMessage()

  const {
    data: eventToClone,
    isLoading: isEventToCloneLoading,
    isError: isEventToCloneErrored,
  } = api.endpoints.readEvent.useQuery(
    cloneEventId > 0 ? { id: cloneEventId } : skipToken,
  )

  // TODO images are urls, currently API doesn't accept them
  const {
    data: images,
    isLoading: isImagesLoading,
    isConverting,
  } = useBase64Images<CorrectEventPropagationImage, any, any, any>(
    api.endpoints.readEventImages,
    cloneEventId > 0 ? { eventId: cloneEventId } : skipToken,
  )

  const { data: questions } = api.endpoints.readEventQuestions.useQuery(
    cloneEventId > 0 ? { eventId: cloneEventId } : skipToken,
  )

  const [createEvent, { isLoading: isSavingEvent }] =
    api.endpoints.createEvent.useMutation()
  const [createEventQuestion, { isLoading: isSavingQuestions }] =
    api.endpoints.createEventQuestion.useMutation()
  const [createEventImage, { isLoading: isSavingImages }] =
    api.endpoints.createEventImage.useMutation()

  const createOrSelectLocation = useCreateOrSelectLocation()

  if (isEventToCloneErrored) return <>Event not found (or different error)</>

  if (
    cloneEventId > 0 &&
    (isEventToCloneLoading || !eventToClone || !images || !questions)
  )
    return <Loading>Stahujeme akci ke zklonování</Loading>

  if (isSavingEvent || isSavingQuestions || isSavingImages)
    return <Loading>Ukládáme akci</Loading>

  const handleSubmit = async ({
    main_image,
    images,
    questions,
    ...data
  }: EventFormShape) => {
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
    // ***location***
    const locationId = await createOrSelectLocation(data.location)

    // save the new event
    const event = await createEvent(
      merge({}, data, { location: locationId, record: null }),
    ).unwrap()
    if (questions) {
      await Promise.all(
        questions.map((question, order) =>
          createEventQuestion({
            eventId: event.id,
            question: { ...question, order },
          }).unwrap(),
        ),
      )
    }

    const allImages = [
      ...(main_image ? [main_image] : []),
      ...(images ?? []),
    ].filter(({ image }) => Boolean(image))
    await Promise.all(
      allImages.map((image, order) =>
        createEventImage({
          eventId: event.id,
          image: { ...image, order },
        }).unwrap(),
      ),
    )
    navigate(`/org/akce/${event.id}`)
    showMessage({ message: 'Akce byla úspěšně vytvořena', type: 'success' })
  }

  const handleCancel = () => {
    navigate('/org')
  }

  const eventToCloneFixed = { ...eventToClone }
  delete eventToCloneFixed.start
  delete eventToCloneFixed.end
  delete eventToCloneFixed.record

  return (
    <EventForm
      id={cloneEventId ? `clone-${cloneEventId}` : 'new'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      initialData={
        eventToClone &&
        images &&
        questions &&
        event2payload(eventToCloneFixed, questions.results ?? [], images ?? [])
      }
      eventToEdit={false}
    />
  )
}

export default CreateEvent
