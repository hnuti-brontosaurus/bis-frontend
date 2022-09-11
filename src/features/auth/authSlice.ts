import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { api } from '../../app/services/bis'
import { RootState } from '../../app/store'

type AuthState = {
  token: string | null
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null } as AuthState,
  reducers: {
    /*setCredentials: (
      state,
      { payload: { token } }: PayloadAction<{ token: string }>,
    ) => {
      state.token = token
    },*/
  },
  extraReducers: builder => {
    builder.addMatcher(
      isAnyOf(
        api.endpoints.login.matchFulfilled,
        api.endpoints.resetPassword.matchFulfilled,
      ),
      (state, { payload }) => {
        state.token = payload.token
      },
    )
  },
})

export default slice.reducer

export const selectCurrentUser = (state: RootState) =>
  state.auth.token ? { name: 'asdf' } : undefined
