import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import { Event, EventPropagationImage, Question } from '../app/services/testApi'
import EventForm, { FormShape } from './EventForm'

const EditEvent = () => {
  const params = useParams()
  const navigate = useNavigate()
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

  const [updateEvent] = api.endpoints.updateEvent.useMutation()
  const [createEventImage] = api.endpoints.createEventImage.useMutation()
  const [updateEventImage] = api.endpoints.updateEventImage.useMutation()
  const [removeEventImage] = api.endpoints.removeEventImage.useMutation()
  const [createEventQuestion] = api.endpoints.createEventQuestion.useMutation()
  const [updateEventQuestion] = api.endpoints.updateEventQuestion.useMutation()
  const [removeEventQuestion] = api.endpoints.removeEventQuestion.useMutation()

  if (isEventLoading || !event || !images || !questions)
    return <>Loading Event</>
  if (isError) return <>Event not found (or different error)</>

  const handleSubmit: Parameters<typeof EventForm>[0]['onSubmit'] = async ({
    main_image: updatedMainImage,
    images: updatedImages,
    questions: updatedQuestions,
    ...event
  }) => {
    // update event
    await updateEvent({ id: eventId, event }).unwrap()
    // ***images***
    // get order from position
    const imagesWithOrder = [
      ...(updatedMainImage ? [updatedMainImage] : []),
      ...updatedImages,
    ].map((image, order) => ({ ...image, order }))

    const newImages: { image: string; order: number }[] = []
    const imagesToPatch: { id: number; image?: string; order?: number }[] = []
    imagesWithOrder.forEach((image, i, imagesWithOrder) => {
      // save every new image
      // images without id are new
      if (!image.id) return newImages.push(image)
      // images with id, but with different
      else {
        // find original image
        const originalImage = images.results!.find(img => img.id === image.id)

        // if they're same, ignore
        if (
          originalImage!.image === image.image &&
          originalImage!.order === image.order
        )
          return
        // otherwise add patch to imagesToPatch
        else {
          const imageToPatch: { id: number; image?: string; order?: number } = {
            id: image.id,
          }
          // update order of any image that changed order
          if (originalImage!.order !== image.order)
            imageToPatch.order = image.order
          // update any image that changed
          if (originalImage!.image !== image.image)
            imageToPatch.image = image.image

          return imagesToPatch.push(imageToPatch)
        }
      }
    })

    // delete any image that is missing
    const imagesToDelete: { id: number }[] = images.results!.filter(
      img => !imagesWithOrder.find(image => image.id === img.id),
    )

    const newImagePromises = newImages.map(image =>
      createEventImage({ eventId, image }).unwrap(),
    )
    const patchedImagePromises = imagesToPatch.map(({ id, ...image }) =>
      updateEventImage({ eventId, id, image }).unwrap(),
    )

    const deletedImagePromises = imagesToDelete.map(({ id }) =>
      removeEventImage({ eventId, id }).unwrap(),
    )

    await Promise.allSettled([
      ...newImagePromises,
      ...patchedImagePromises,
      ...deletedImagePromises,
    ])
    // ***questions***
    // save every new question
    // get order from position
    const questionsWithOrder = updatedQuestions.map((question, order) => ({
      ...question,
      order,
    }))
    /// create the questions that are new
    const newQuestionPromises = questionsWithOrder
      .filter(q => !q.id)
      .map(question => createEventQuestion({ eventId, question }).unwrap())
    // update any changed questions
    const patchedQuestionPromises = questionsWithOrder
      .filter(question => {
        const oldQuestion = questions.results!.find(oq => oq.id === question.id)
        // if something is different, patch
        return (
          oldQuestion &&
          !(
            oldQuestion.id === question.id &&
            oldQuestion.is_required === question.is_required &&
            oldQuestion.order === question.order &&
            oldQuestion.question === question.question
          )
        )
      })
      .map(({ id, ...question }) =>
        updateEventQuestion({ eventId, id: id as number, question }).unwrap(),
      )

    // delete any question that is missing
    const deletedQuestionPromises = questions
      .results!.filter(
        q => !questionsWithOrder.find(question => question.id === q.id),
      )
      .map(({ id }) => removeEventQuestion({ eventId, id }).unwrap())

    await Promise.allSettled([
      ...newQuestionPromises,
      ...patchedQuestionPromises,
      ...deletedQuestionPromises,
    ])

    await navigate(`/org/akce/${eventId}`)
  }

  return (
    <EventForm
      initialData={event2payload(
        event,
        questions?.results ?? [],
        images?.results ?? [],
      )}
      onSubmit={handleSubmit}
      eventToEdit={true}
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

export const event2payload = (
  event: Partial<Event>,
  questions: Question[],
  images: EventPropagationImage[],
): Partial<FormShape> => {
  const [main_image, ...otherImages] = [...images].sort(sortOrder)

  return (
    event && {
      ...event,
      group: event?.group?.id,
      category: event?.category?.id,
      program: event?.program?.id,
      intended_for: event?.intended_for?.id,
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
