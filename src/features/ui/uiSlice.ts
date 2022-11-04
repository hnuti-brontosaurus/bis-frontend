import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

type UIState = {
  showHeader: boolean
}

const slice = createSlice({
  name: 'ui',
  initialState: { showHeader: true } as UIState,
  reducers: {
    showHeader: (state, { payload: show }: PayloadAction<boolean>) => {
      state.showHeader = show
    },
  },
})

const { actions, reducer } = slice

export default reducer

export { actions }

export const selectShowHeader = (state: RootState) => state.ui.showHeader
