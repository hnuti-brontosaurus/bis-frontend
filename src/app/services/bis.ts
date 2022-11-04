// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Overwrite } from 'utility-types'
import { ClearBounds } from '../../components/Map'
import { RootState } from '../store'
import {
  AdministrationUnit,
  DietCategory,
  Event,
  EventCategory,
  EventGroupCategory,
  EventIntendedForCategory,
  EventPhoto,
  EventProgramCategory,
  EventPropagationImage,
  FinanceReceipt,
  Location,
  Opportunity,
  OpportunityCategory,
  Propagation,
  QualificationCategory,
  Question,
  User,
} from './testApi'

export type PaginatedList<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL ?? '/api/',
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('authorization', `Token ${token}`)
      }
      return headers
    },
  }),
  tagTypes: [
    'User',
    'Event',
    'EventImage',
    'EventPhoto',
    'EventQuestion',
    'FinanceReceipt',
    'Location',
    'Opportunity',
  ],
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: credentials => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: `auth/logout/`, method: 'POST' }),
    }),
    sendResetPasswordLink: build.mutation<unknown, { email: string }>({
      query: body => ({
        url: 'auth/send_verification_link/',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: build.mutation<
      LoginResponse,
      { code: string; email: string; password: string }
    >({
      query: body => ({
        url: 'auth/reset_password/',
        method: 'POST',
        body,
      }),
    }),
    whoami: build.query<{ id: number }, void>({
      query: () => 'auth/whoami/',
    }),
    // frontendUsersRetrieve
    getUser: build.query<User, { id: number }>({
      query: ({ id }) => `frontend/users/${id}/`,
      providesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    getEventCategories: build.query<PaginatedList<EventCategory>, void>({
      query: () => ({
        url: `categories/event_categories/`,
      }),
    }),
    getEventGroups: build.query<PaginatedList<EventGroupCategory>, void>({
      query: () => ({
        url: `categories/event_group_categories/`,
      }),
    }),
    getPrograms: build.query<PaginatedList<EventProgramCategory>, void>({
      query: () => ({
        url: `categories/event_program_categories/`,
      }),
    }),
    getIntendedFor: build.query<PaginatedList<EventIntendedForCategory>, void>({
      query: () => ({
        url: `categories/event_intended_for_categories/`,
      }),
    }),
    getDiets: build.query<PaginatedList<DietCategory>, void>({
      query: () => ({
        url: `categories/diet_categories/`,
      }),
    }),
    getAdministrationUnits: build.query<
      PaginatedList<AdministrationUnit>,
      ListArguments & {
        /** Více hodnot lze oddělit čárkami. */
        category?: (
          | 'basic_section'
          | 'club'
          | 'headquarter'
          | 'regional_center'
        )[]
      }
    >({
      query: queryArg => ({
        url: `web/administration_units/`,
        params: {
          category: queryArg.category,
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
    }),
    readQualifications: build.query<
      PaginatedList<QualificationCategory>,
      {
        /** A page number within the paginated result set. */
        page?: number
        /** Number of results to return per page. */
        pageSize?: number
        /** A search term. */
        search?: string
      }
    >({
      query: queryArg => ({
        url: `categories/qualification_categories/`,
        params: {
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
    }),
    readUsers: build.query<
      PaginatedList<User>,
      { id?: number[]; search?: string }
    >({
      query: ({ id, search }) => ({
        url: `frontend/users/`,
        params: {
          //birthday: queryArg.birthday,
          //first_name: queryArg.firstName,
          ...(id ? { id: id.join(',') } : {}),
          ...(typeof search === 'string' ? { search } : {}),
          //last_name: queryArg.lastName,
          //ordering: queryArg.ordering,
          //page: queryArg.page,
        },
      }),
      providesTags: results =>
        results?.results
          ? results.results.map(user => ({
              type: 'User',
              id: user.id,
            }))
          : [],
    }),
    createLocation: build.mutation<
      CorrectLocation,
      Omit<CorrectLocation, 'id'>
    >({
      query: queryArg => ({
        url: `frontend/locations/`,
        method: 'POST',
        body: queryArg,
      }),
      invalidatesTags: () => [
        { type: 'Location' as const, id: 'LOCATION_LIST' },
      ],
    }),

    readUserByBirthdate: build.query<
      User,
      { first_name: string; last_name: string; birthday: string }
    >({
      query: queryArg => ({
        url: `frontend/get_unknown_user/`,
        method: 'POST',
        body: queryArg,
      }),
    }),
    readLocations: build.query<
      PaginatedList<CorrectLocation>,
      {
        /** Více hodnot lze oddělit čárkami. */
        id?: number[]
        /** A page number within the paginated result set. */
        page?: number
        /** Number of results to return per page. */
        pageSize?: number
        /** A search term. */
        search?: string
        // This doesn't exist, but we want it!
        bounds?: ClearBounds
      }
    >({
      query: queryArg => ({
        url: `frontend/locations/`,
        params: {
          id: queryArg.id,
          page: queryArg.page,
          page_size: queryArg.bounds ? 5000 : queryArg.pageSize, // this will fetch everything (cry)
          search: queryArg.search,
        },
      }),
      providesTags: results =>
        (results?.results
          ? results.results.map(
              location =>
                ({
                  type: 'Location' as const,
                  id: location.id,
                } as { type: 'Location'; id: 'LOCATION_LIST' | number }),
            )
          : []
        ).concat([{ type: 'Location' as const, id: 'LOCATION_LIST' }]),
    }),
    readLocation: build.query<CorrectLocation, { id: number }>({
      query: queryArg => ({ url: `frontend/locations/${queryArg.id}/` }),
      providesTags: (results, _, { id }) => [{ type: 'Location' as const, id }],
    }),
    updateLocation: build.mutation<
      CorrectLocation,
      { id: number; location: Partial<CorrectLocation> }
    >({
      query: queryArg => ({
        url: `frontend/locations/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.location,
      }),
      invalidatesTags: (results, _, { id }) => [
        { type: 'Location' as const, id: 'LOCATION_LIST' },
        { type: 'Location' as const, id },
      ],
    }),
    readOpportunity: build.query<
      CorrectOpportunity,
      { userId: number; id: number }
    >({
      query: queryArg => ({
        url: `frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
      }),
      providesTags: (result, error, { id }) => [{ type: 'Opportunity', id }],
    }),
    readOpportunities: build.query<
      PaginatedList<CorrectOpportunity>,
      {
        userId: number
        id?: number[]
        page?: number
        pageSize?: number
        search?: string
      }
    >({
      query: queryArg => ({
        url: `frontend/users/${queryArg.userId}/opportunities/`,
        params: {
          id: queryArg.id,
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: results =>
        (results?.results
          ? results.results.map(
              opportunity =>
                ({
                  type: 'Opportunity' as const,
                  id: opportunity.id,
                } as { type: 'Opportunity'; id: 'OPPORTUNITY_LIST' | number }),
            )
          : []
        ).concat([{ type: 'Opportunity' as const, id: 'OPPORTUNITY_LIST' }]),
    }),
    createOpportunity: build.mutation<
      CorrectOpportunity,
      { userId: number; opportunity: OpportunityPayload }
    >({
      query: ({ userId, opportunity }) => ({
        url: `frontend/users/${userId}/opportunities/`,
        method: 'POST',
        body: opportunity,
      }),
      invalidatesTags: () => [{ type: 'Opportunity', id: 'OPPORTUNITY_LIST' }],
    }),
    updateOpportunity: build.mutation<
      CorrectOpportunity,
      {
        id: number
        userId: number
        patchedOpportunity: Partial<OpportunityPayload>
      }
    >({
      query: queryArg => ({
        url: `frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedOpportunity,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Opportunity', id: 'OPPORTUNITY_LIST' },
        { type: 'Opportunity', id },
      ],
    }),
    deleteOpportunity: build.mutation<void, { id: number; userId: number }>({
      query: queryArg => ({
        url: `frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Opportunity', id: 'OPPORTUNITY_LIST' },
        { type: 'Opportunity', id },
      ],
    }),
    readOrganizedEvents: build.query<
      PaginatedList<Event>,
      {
        userId: number
        id?: number[]
        page?: number
        pageSize?: number
        search?: string
      }
    >({
      query: queryArg => ({
        url: `frontend/users/${queryArg.userId}/events_where_was_organizer/`,
        params: {
          id: queryArg.id,
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: (results, error, { userId, id, page }) =>
        results?.results
          ? [
              ...results.results.map(event => ({
                type: 'Event' as const,
                id: event.id,
              })),
              {
                type: 'Event' as const,
                id: `ORGANIZED_EVENT_LIST`,
              },
            ]
          : [
              {
                type: 'Event' as const,
                id: `ORGANIZED_EVENT_LIST`,
              },
            ],
    }),
    readOpportunityCategories: build.query<
      PaginatedList<OpportunityCategory>,
      {
        page?: number
        pageSize?: number
        search?: string
      }
    >({
      query: queryArg => ({
        url: `categories/opportunity_categories/`,
        params: {
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: results =>
        (results?.results
          ? results.results.map(
              opportunity =>
                ({
                  type: 'Opportunity' as const,
                  id: opportunity.id,
                } as { type: 'Opportunity'; id: 'OPPORTUNITY_LIST' | number }),
            )
          : []
        ).concat([{ type: 'Opportunity' as const, id: 'OPPORTUNITY_LIST' }]),
    }),
    createEvent: build.mutation<Event, EventPayload>({
      query: event => ({
        url: `frontend/events/`,
        method: 'POST',
        body: event,
      }),
      invalidatesTags: () => [{ type: 'Event', id: 'ORGANIZED_EVENT_LIST' }],
    }),
    readEvent: build.query<Event, { id: number }>({
      query: queryArg => ({ url: `frontend/events/${queryArg.id}/` }),
      providesTags: (result, error, { id }) => [{ type: 'Event', id }],
    }),
    updateEvent: build.mutation<
      Event,
      { id: number; event: Partial<EventPayload> }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.event,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'ORGANIZED_EVENT_LIST' },
      ],
    }),
    removeEvent: build.mutation<void, { id: number }>({
      query: queryArg => ({
        url: `frontend/events/${queryArg.id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Event', id },
        { type: 'Event', id: 'ORGANIZED_EVENT_LIST' },
      ],
    }),
    createEventImage: build.mutation<
      EventPropagationImage,
      { eventId: number; image: Omit<EventPropagationImage, 'id'> }
    >({
      query: ({ eventId, image }) => ({
        url: `frontend/events/${eventId}/propagation/images/`,
        method: 'POST',
        body: image,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'EventImage', id: `${eventId}_IMAGE_LIST` },
      ],
    }),
    readEventImages: build.query<
      PaginatedList<CorrectEventPropagationImage>,
      {
        eventId: number
        page?: number
        pageSize?: number
        search?: string
      }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/propagation/images/`,
        params: {
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: (results, error, { eventId }) =>
        results?.results
          ? results.results
              .map(image => ({
                type: 'EventImage' as const,
                id: `${eventId}_${image.id}`,
              }))
              .concat([
                { type: 'EventImage' as const, id: `${eventId}_IMAGE_LIST` },
              ])
          : [],
    }),
    updateEventImage: build.mutation<
      EventPropagationImage,
      {
        eventId: number
        id: number
        image: Partial<Omit<EventPropagationImage, 'id'>>
      }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/propagation/images/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.image,
      }),
      invalidatesTags: (result, error, { id, eventId }) => [
        { type: 'EventImage', id: `${eventId}_${id}` },
        { type: 'EventImage', id: `${eventId}_IMAGE_LIST` },
      ],
    }),
    removeEventImage: build.mutation<void, { eventId: number; id: number }>({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/propagation/images/${queryArg.id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'EventImage', id: `${eventId}_${id}` },
        { type: 'EventImage', id: `${eventId}_IMAGE_LIST` },
      ],
    }),
    createEventQuestion: build.mutation<
      Question,
      { eventId: number; question: Omit<Question, 'id'> }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/registration/questionnaire/questions/`,
        method: 'POST',
        body: queryArg.question,
      }),
    }),
    readEventQuestions: build.query<
      PaginatedList<Question>,
      {
        eventId: number
        page?: number
        pageSize?: number
        search?: string
      }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/registration/questionnaire/questions/`,
        params: {
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: (results, error, { eventId }) =>
        results?.results
          ? results.results
              .map(question => ({
                type: 'EventQuestion' as const,
                id: `${eventId}_${question.id}`,
              }))
              .concat([
                {
                  type: 'EventQuestion' as const,
                  id: `${eventId}_QUESTION_LIST`,
                },
              ])
          : [],
    }),
    updateEventQuestion: build.mutation<
      Question,
      { eventId: number; id: number; question: Partial<Omit<Question, 'id'>> }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/registration/questionnaire/questions/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.question,
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'EventQuestion', id: `${eventId}_${id}` },
        { type: 'EventQuestion', id: `${eventId}_QUESTION_LIST` },
      ],
    }),
    removeEventQuestion: build.mutation<void, { eventId: number; id: number }>({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/registration/questionnaire/questions/${queryArg.id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'EventQuestion', id: `${eventId}_${id}` },
        { type: 'EventQuestion', id: `${eventId}_QUESTION_LIST` },
      ],
    }),
    createFinanceReceipt: build.mutation<
      FinanceReceipt,
      {
        eventId: number
        financeReceipt: Omit<FinanceReceipt, 'id'>
      }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/finance/receipts/`,
        method: 'POST',
        body: queryArg.financeReceipt,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'FinanceReceipt', id: `${eventId}_RECEIPT_LIST` },
      ],
    }),
    readFinanceReceipts: build.query<
      PaginatedList<FinanceReceipt>,
      ListArguments & { eventId: number }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/finance/receipts/`,
        params: {
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: (results, error, { eventId }) =>
        results?.results
          ? results.results
              .map(receipt => ({
                type: 'FinanceReceipt' as const,
                id: `${eventId}_${receipt.id}`,
              }))
              .concat([
                {
                  type: 'FinanceReceipt' as const,
                  id: `${eventId}_RECEIPT_LIST`,
                },
              ])
          : [],
    }),
    updateFinanceReceipt: build.mutation<
      FinanceReceipt,
      {
        eventId: number
        id: number
        patchedFinanceReceipt: Partial<FinanceReceipt>
      }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/finance/receipts/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedFinanceReceipt,
      }),
      invalidatesTags: (result, error, { id, eventId }) => [
        { type: 'FinanceReceipt', id: `${eventId}_${id}` },
        { type: 'FinanceReceipt', id: `${eventId}_RECEIPT_LIST` },
      ],
    }),
    deleteFinanceReceipt: build.mutation<void, { eventId: number; id: number }>(
      {
        query: queryArg => ({
          url: `frontend/events/${queryArg.eventId}/finance/receipts/${queryArg.id}/`,
          method: 'DELETE',
        }),
        invalidatesTags: (result, error, { id, eventId }) => [
          { type: 'FinanceReceipt', id: `${eventId}_${id}` },
          { type: 'FinanceReceipt', id: `${eventId}_RECEIPT_LIST` },
        ],
      },
    ),
    createEventPhoto: build.mutation<
      EventPhoto,
      { eventId: number; eventPhoto: Omit<EventPhoto, 'id'> }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/record/photos/`,
        method: 'POST',
        body: queryArg.eventPhoto,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'EventPhoto', id: `${eventId}_EVENT_PHOTO_LIST` },
      ],
    }),
    readEventPhotos: build.query<
      PaginatedList<Overwrite<EventPhoto, { photo: CorrectImage }>>,
      ListArguments & { eventId: number }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/record/photos/`,
        params: {
          page: queryArg.page,
          page_size: queryArg.pageSize,
          search: queryArg.search,
        },
      }),
      providesTags: (results, error, { eventId }) =>
        results?.results
          ? results.results
              .map(receipt => ({
                type: 'EventPhoto' as const,
                id: `${eventId}_${receipt.id}`,
              }))
              .concat([
                {
                  type: 'EventPhoto' as const,
                  id: `${eventId}_EVENT_PHOTO_LIST`,
                },
              ])
          : [],
    }),
    updateEventPhoto: build.mutation<
      EventPhoto,
      { eventId: number; id: number; patchedEventPhoto: Partial<EventPhoto> }
    >({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/record/photos/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedEventPhoto,
      }),
      invalidatesTags: (result, error, { id, eventId }) => [
        { type: 'EventPhoto', id: `${eventId}_${id}` },
        { type: 'EventPhoto', id: `${eventId}_EVENT_PHOTO_LIST` },
      ],
    }),
    deleteEventPhoto: build.mutation<void, { eventId: number; id: number }>({
      query: queryArg => ({
        url: `frontend/events/${queryArg.eventId}/record/photos/${queryArg.id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, eventId }) => [
        { type: 'EventPhoto', id: `${eventId}_${id}` },
        { type: 'EventPhoto', id: `${eventId}_EVENT_PHOTO_LIST` },
      ],
    }),
  }),
})

export type PropagationPayload = Omit<Propagation, 'diets'> & {
  diets: number[]
}

export type EventPayload = Omit<
  Event,
  'intended_for' | 'group' | 'category' | 'program' | 'propagation'
> & {
  group: number
  category: number
  program: number
  intended_for: number
  propagation?: PropagationPayload | null
}

type CorrectImage = {
  small: string
  medium: string
  large: string
  original: string
}

export type OpportunityPayload = Overwrite<
  Opportunity,
  {
    category: number
  }
>

export type CorrectEventPropagationImage = Overwrite<
  EventPropagationImage,
  { image: CorrectImage }
>

interface ListArguments {
  /** A page number within the paginated result set. */
  page?: number
  /** Number of results to return per page. */
  pageSize?: number
  /** A search term. */
  search?: string
}

export type CorrectOpportunity = Overwrite<Opportunity, { image: CorrectImage }>

export type CorrectLocation = Overwrite<
  Location,
  {
    gps_location?: {
      type: 'Point'
      coordinates: [number, number]
    }
  }
>
