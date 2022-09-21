// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'
import {
  DietCategory,
  EventCategory,
  EventGroupCategory,
  EventProgramCategory,
  PropagationIntendedForCategory,
  User,
} from './testApi'

type PaginatedList<T> = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
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
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: credentials => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
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
    getIntendedFor: build.query<
      PaginatedList<PropagationIntendedForCategory>,
      void
    >({
      query: () => ({
        url: `categories/propagation_intended_for_categories/`,
      }),
    }),
    getDiets: build.query<PaginatedList<DietCategory>, void>({
      query: () => ({
        url: `categories/diet_categories/`,
      }),
    }),
  }),
})
