import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { api } from '../../app/services/bis'
import { User } from '../../app/services/bisTypes'
import { RootState } from '../../app/store'

type AuthState = {
  user: User | null
  token: string | null
  isLoggingOut: boolean
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, isLoggingOut: false } as AuthState,
  reducers: {},
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

export default slice.reducer

export const selectAuthenticated = (state: RootState) =>
  Boolean(state.auth.token)

export const selectLoggingOut = (state: RootState) => state.auth.isLoggingOut
