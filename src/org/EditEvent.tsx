import { Loading, useCreateOrSelectLocation } from 'components'
import merge from 'lodash/merge'
import { useNavigate, useParams } from 'react-router-dom'
import { Optional } from 'utility-types'
import { api } from '../app/services/bis'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from '../features/systemMessage/useSystemMessage'
import { FullEvent, useReadFullEvent } from '../hooks/readFullEvent'
import { useTitle } from '../hooks/title'
import EventForm, { InitialEventData } from './EventForm'

const EditEvent = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const navigate = useNavigate()
  const showMessage = useShowMessage()

  const {
    data: event,
    isLoading: isEventLoading,
    isError,
  } = useReadFullEvent(eventId)

  // TODO maybe: add star when data are unsaved (also persistent data)
  useTitle(event ? `Upravit akci ${event.name}` : 'Upravit akci')

  const [updateEvent, { error: updateEventError, isLoading: isUpdatingEvent }] =
    api.endpoints.updateEvent.useMutation()
  const [createEventImage, { isLoading: isCreatingImage }] =
    api.endpoints.createEventImage.useMutation()
  const [updateEventImage, { isLoading: isUpdatingImage }] =
    api.endpoints.updateEventImage.useMutation()
  const [removeEventImage, { isLoading: isRemovingImage }] =
    api.endpoints.removeEventImage.useMutation()
  const [createEventQuestion, { isLoading: isCreatingQuestion }] =
    api.endpoints.createEventQuestion.useMutation()
  const [updateEventQuestion, { isLoading: isUpdatingQuestion }] =
    api.endpoints.updateEventQuestion.useMutation()
  const [removeEventQuestion, { isLoading: isRemovingQuestion }] =
    api.endpoints.removeEventQuestion.useMutation()

  useShowApiErrorMessage(updateEventError, 'Nepodařilo se uložit změny')

  const createOrSelectLocation = useCreateOrSelectLocation()

  if (
    isUpdatingEvent ||
    isCreatingImage ||
    isUpdatingImage ||
    isRemovingImage ||
    isCreatingQuestion ||
    isUpdatingQuestion ||
    isRemovingQuestion
  )
    return <Loading>Ukládáme změny</Loading>

  if (isError) return <>Event not found (or different error)</>

  if (isEventLoading || !event) return <Loading>Stahujeme akci</Loading>

  const { images, questions } = event
  const handleSubmit: Parameters<typeof EventForm>[0]['onSubmit'] = async ({
    main_image: updatedMainImage,
    images: updatedImages,
    questions: updatedQuestions,
    ...event
  }) => {
    // ***location***
    const locationId = await createOrSelectLocation(event.location)

    // clean up unfilled fields which cause api problems
    if (event.record?.comment_on_work_done === null)
      delete event.record.comment_on_work_done
    if (event.record?.total_hours_worked === null)
      delete event.record.total_hours_worked

    // update event
    await updateEvent({
      id: eventId,
      event: merge({}, event, {
        location: locationId,
      }),
    }).unwrap()

    // ***images***
    // get order from position

    const imagesWithOrder = [
      ...(updatedMainImage ? [updatedMainImage] : []),
      ...updatedImages,
    ]
      .filter(({ image }) => image) // ignore undefined images
      .map((image, order) => ({ ...image, order }))

    const newImages: { image: string; order: number }[] = []
    const imagesToPatch: { id: number; image?: string; order?: number }[] = []
    imagesWithOrder.forEach((image, i, imagesWithOrder) => {
      // save every new image
      // images without id are new
      if (!image.id) return newImages.push(image)
      // images with id, but with different
      else {
        // find original image
        const originalImage = images.find(img => img.id === image.id)

        // if they're same, ignore
        if (
          originalImage!.image.original === image.image &&
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
          if (originalImage!.image.original !== image.image)
            imageToPatch.image = image.image

          return imagesToPatch.push(imageToPatch)
        }
      }
    })

    // delete any image that is missing, or any image that has image: null
    const imagesToDelete: { id: number }[] = images.filter(
      img =>
        (img.id && !img.image) ||
        !imagesWithOrder.find(image => image.id === img.id),
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
    //TODO inform users when something fails

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
        const oldQuestion = questions.find(oq => oq.id === question.id)
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
      .filter(q => !questionsWithOrder.find(question => question.id === q.id))
      .map(({ id }) => removeEventQuestion({ eventId, id }).unwrap())

    await Promise.allSettled([
      ...newQuestionPromises,
      ...patchedQuestionPromises,
      ...deletedQuestionPromises,
    ])
    //TODO inform users when something fails

    navigate(`/org/akce/${eventId}`)
    showMessage({ message: 'Akce byla úspěšně změněna', type: 'success' })
  }

  const handleCancel = () => {
    navigate(`/org/akce/${eventId}`)
  }

  return (
    <EventForm
      id={String(eventId)}
      initialData={event2payload(event)}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
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
  event: Optional<FullEvent, 'id' | 'start' | 'start_time' | 'end' | 'record'>,
): Partial<InitialEventData> => {
  const [main_image, ...otherImages] = event.images
    .map(img => ({
      ...img,
      image: img.image.original,
    }))
    .sort(sortOrder)

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
      questions: [...event.questions].sort(sortOrder),
    }
  )
}
