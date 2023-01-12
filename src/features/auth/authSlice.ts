import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { api } from 'app/services/bis'
import { RootState } from 'app/store'
import type { RoleSlug } from 'utils/helpers'

type AuthState = {
  role: RoleSlug | null
  token: string | null
  isLoggingOut: boolean
}

const slice = createSlice({
  name: 'auth',
  initialState: { role: null, token: null, isLoggingOut: false } as AuthState,
  reducers: {
    setRole: (state, { payload }: PayloadAction<RoleSlug>) => {
      state.role = payload
    },
    setInitialRole: (state, { payload }: PayloadAction<RoleSlug>) => {
      if (!state.role) state.role = payload
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        isAnyOf(
          api.endpoints.login.matchFulfilled,
          api.endpoints.resetPassword.matchFulfilled,
        ),
        (state, { payload }) => {
          state.token = payload.token
        },
      )
      .addMatcher(api.endpoints.logout.matchPending, state => {
        state.isLoggingOut = true
      })
      .addMatcher(
        isAnyOf(
          api.endpoints.logout.matchFulfilled,
          api.endpoints.logout.matchRejected,
        ),
        state => {
          state.isLoggingOut = false
        },
      )
  },
})

export const { actions, reducer } = slice

export const selectAuthenticated = (state: RootState) =>
  Boolean(state.auth.token)

export const selectLoggingOut = (state: RootState) => state.auth.isLoggingOut

export const selectCurrentRole = (state: RootState) => state.auth.role
