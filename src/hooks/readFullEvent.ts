import { skipToken } from '@reduxjs/toolkit/query'
import { mergeWith } from 'lodash'
import { Assign, Overwrite } from 'utility-types'
import {
  api,
  CorrectEventPropagationImage,
  CorrectLocation,
} from '../app/services/bis'
import { Event, Propagation, Question, User } from '../app/services/bisTypes'

export type FullEvent = Assign<
  Overwrite<
    Event,
    {
      main_organizer: User // in older events, main_organizer may be missing
      other_organizers: User[]
      propagation: Overwrite<Propagation, { contact_person: User }> // in older events, contact_person may be missing
      location: CorrectLocation | undefined
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
  const locationQuery = api.endpoints.readLocation.useQuery(
    event?.location ? { id: event.location } : skipToken,
  )

  const allQueries = [
    eventQuery,
    imagesQuery,
    questionsQuery,
    mainOrganizerQuery,
    otherOrganizersQuery,
    contactPersonQuery,
    locationQuery,
  ]

  const isLoading = allQueries.some(query => query.isLoading)
  const isSuccess = allQueries.every(query => query.isSuccess)
  const isError = allQueries.some(query => query.isError)

  return {
    data:
      eventQuery.data &&
      imagesQuery.data &&
      (!eventQuery.data.main_organizer || mainOrganizerQuery.data) &&
      otherOrganizersQuery.data &&
      (!eventQuery.data.propagation?.contact_person ||
        contactPersonQuery.data) &&
      questionsQuery.data &&
      (!eventQuery.data.location || locationQuery.data)
        ? {
            ...eventQuery.data,
            main_organizer: mainOrganizerQuery.data as User, // in some old events this might be missing
            other_organizers: otherOrganizersQuery.data.results,
            propagation: mergeWith(
              {},
              eventQuery.data.propagation,
              { contact_person: contactPersonQuery.data },
              (a, b) => (Array.isArray(b) ? b : undefined),
            ),
            images: imagesQuery.data.results,
            questions: questionsQuery.data.results,
            location:
              (eventQuery.data.location && locationQuery.data) || undefined,
          }
        : undefined,
    isLoading,
    isSuccess,
    isError,
  }
}
