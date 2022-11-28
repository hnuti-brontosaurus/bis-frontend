import { skipToken } from '@reduxjs/toolkit/query'
import { mergeWith } from 'lodash'
import { Assign, Overwrite } from 'utility-types'
import { api, CorrectEventPropagationImage } from '../app/services/bis'
import { Event, Propagation, Question, User } from '../app/services/testApi'

export type FullEvent = Assign<
  Overwrite<
    Event,
    {
      main_organizer: User
      other_organizers: User[]
      propagation: Overwrite<
        Propagation,
        {
          contact_person: User
        }
      >
    }
  >,
  {
    images: CorrectEventPropagationImage[]
    questions: Question[]
  }
>

export const useReadFullEvent = (
  eventId: number,
): {
  data: FullEvent | undefined
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
} => {
  const eventQuery = api.endpoints.readEvent.useQuery(
    eventId > 0 ? { id: eventId } : skipToken,
  )
  const event = eventQuery.data
  const imagesQuery = api.endpoints.readEventImages.useQuery(
    eventId > 0 ? { eventId } : skipToken,
  )
  const questionsQuery = api.endpoints.readEventQuestions.useQuery(
    eventId > 0
      ? {
          eventId,
        }
      : skipToken,
  )
  const mainOrganizerQuery = api.endpoints.getUser.useQuery(
    event?.main_organizer ? { id: event.main_organizer } : skipToken,
  )
  const otherOrganizersQuery = api.endpoints.readUsers.useQuery(
    event?.other_organizers ? { id: event.other_organizers } : skipToken,
  )
  const contactPersonQuery = api.endpoints.getUser.useQuery(
    event?.propagation?.contact_person
      ? { id: event.propagation.contact_person }
      : skipToken,
  )

  const allQueries = [
    eventQuery,
    imagesQuery,
    questionsQuery,
    mainOrganizerQuery,
    otherOrganizersQuery,
    contactPersonQuery,
  ]

  const isLoading = allQueries.every(query => query.isLoading)
  const isSuccess = allQueries.every(query => query.isSuccess)
  const isError = allQueries.every(query => query.isError)

  return {
    data:
      eventQuery.data &&
      imagesQuery.data &&
      mainOrganizerQuery.data &&
      otherOrganizersQuery.data &&
      contactPersonQuery.data &&
      questionsQuery.data
        ? {
            ...eventQuery.data,
            main_organizer: mainOrganizerQuery.data,
            other_organizers: otherOrganizersQuery.data.results,
            propagation: mergeWith(
              {},
              eventQuery.data.propagation,
              {
                contact_person: contactPersonQuery.data,
              },
              (a, b) => (Array.isArray(b) ? b : undefined),
            ),
            images: imagesQuery.data.results,
            questions: questionsQuery.data.results,
          }
        : undefined,
    isLoading,
    isSuccess,
    isError,
  }
}
