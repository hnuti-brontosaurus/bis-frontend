import { createSlice } from '@reduxjs/toolkit'
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
      api.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.token
      },
    )
  },
})

export default slice.reducer

export const selectCurrentUser = (state: RootState) =>
  state.auth.token ? { name: 'asdf' } : undefined
/*
export const { setCredentials } = slice.actions

export default slice.reducer

import { api } from '../../app/services/bis'

type AuthState = {
  user: User | null
  token: string | null
}

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null } as AuthState,
  reducers: {},
})

export default slice.reducer

export const selectCurrentUser = (state: RootState) => state.auth.user
*/
