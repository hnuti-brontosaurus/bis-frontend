import { useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import { Event, EventPropagationImage, Question } from '../app/services/testApi'
import EventForm, { FormShape } from './EventForm'

const EditEvent = () => {
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

  if (isEventLoading || !event || !images || !questions)
    return <>Loading Event</>
  if (isError) return <>Event not found (or different error)</>

  return (
    <EventForm
      initialData={event2payload(
        event,
        questions?.results ?? [],
        images?.results ?? [],
      )}
      onSubmit={data => console.log(data)}
    />
  )
}

export default EditEvent

/* This sorts lowest order first, and highest or missing order last */
const sortOrder = <T extends { order?: number }>(a: T, b: T) => {
  const aOrder = a.order ?? Infinity
  const bOrder = b.order ?? Infinity
  return aOrder - bOrder
}

const event2payload = (
  event: Event,
  questions: Question[],
  images: EventPropagationImage[],
): FormShape => {
  const [main_image, ...otherImages] = [...images].sort(sortOrder)

  return (
    event && {
      ...event,
      group: event.group.id,
      category: event.category.id,
      program: event.program.id,
      intended_for: event.intended_for.id,
      propagation: event.propagation && {
        ...event.propagation,
        diets: event.propagation.diets.map(diet => diet.id),
      },
      main_image,
      images: otherImages,
      questions: [...questions].sort(sortOrder),
    }
  )
}
