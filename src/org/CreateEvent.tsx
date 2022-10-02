import { useNavigate } from 'react-router-dom'
import { api } from '../app/services/bis'
import EventForm, { FormShape } from './EventForm'

const CreateEvent = () => {
  const navigate = useNavigate()

  const [createEvent, { isLoading: isSavingEvent }] =
    api.endpoints.createEvent.useMutation()
  const [createEventQuestion, { isLoading: isSavingQuestions }] =
    api.endpoints.createEventQuestion.useMutation()
  const [createEventImage, { isLoading: isSavingImages }] =
    api.endpoints.createEventImage.useMutation()

  if (isSavingEvent || isSavingQuestions || isSavingImages)
    return <div>Saving event</div>

  const handleSubmit = async ({
    main_image,
    images,
    questions,
    ...data
  }: FormShape) => {
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
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

  return <EventForm onSubmit={handleSubmit} />
}

export default CreateEvent
