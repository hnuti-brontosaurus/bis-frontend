import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, CorrectEventPropagationImage } from '../app/services/bis'
import { Location } from '../app/services/testApi'
import { useBase64Images } from '../hooks/base64Images'
import { event2payload } from './EditEvent'
import EventForm, { FormShape } from './EventForm'

const CreateEvent = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const cloneEventId = Number(searchParams.get('klonovat'))

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

  const { data: questions, isLoading: isQuestionsLoading } =
    api.endpoints.readEventQuestions.useQuery(
      cloneEventId > 0 ? { eventId: cloneEventId } : skipToken,
    )

  const [createEvent, { isLoading: isSavingEvent }] =
    api.endpoints.createEvent.useMutation()
  const [createEventQuestion, { isLoading: isSavingQuestions }] =
    api.endpoints.createEventQuestion.useMutation()
  const [createEventImage, { isLoading: isSavingImages }] =
    api.endpoints.createEventImage.useMutation()
  const [createLocation] = api.endpoints.createLocation.useMutation()
  const [updateLocation] = api.endpoints.updateLocation.useMutation()

  if (isEventToCloneErrored) return <>Event not found (or different error)</>

  if (
    cloneEventId > 0 &&
    (isEventToCloneLoading || !eventToClone || !images || !questions)
  )
    return <div>Fetching event to clone</div>

  if (isSavingEvent || isSavingQuestions || isSavingImages)
    return <div>Saving event</div>

  const handleSubmit = async ({
    main_image,
    images,
    questions,
    locationData,
    ...data
  }: FormShape) => {
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
    // ***location***
    if (locationData) {
      // create location, when it's new
      if (!locationData.id) {
        if (locationData?.gps_location?.coordinates) {
          locationData.gps_location.type = 'Point'
          locationData.gps_location.coordinates =
            locationData.gps_location.coordinates.map(a => +a)
        }
        locationData.patron = null
        locationData.contact_person = null

        const { id } = await createLocation(locationData).unwrap()
        data.location = id
      }
      // otherwise update the location
      else {
        await updateLocation({
          id: locationData.id,
          location: locationData as Location,
        }).unwrap()
      }
    }

    // save the new event
    const event = await createEvent(data).unwrap()
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
  }

  const eventToCloneFixed = { ...eventToClone }
  delete eventToCloneFixed.start
  delete eventToCloneFixed.end

  return (
    <EventForm
      onSubmit={handleSubmit}
      initialData={
        eventToClone &&
        images &&
        questions &&
        event2payload(eventToCloneFixed, questions.results ?? [], images ?? [])
      }
    />
  )
}

export default CreateEvent
