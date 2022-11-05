import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import merge from 'lodash/merge'
import { DeepPartial } from 'utility-types'
import { RootState } from '../../app/store'
import { CloseEventFormShape } from '../../org/CloseEvent/CloseEventForm'
import { EventFormShape } from '../../org/EventForm'
import { OpportunityFormShape } from '../../org/OpportunityForm'

type FormState<K extends string = string> = {
  event: Record<K, EventFormShape>
  closeEvent: Record<K, CloseEventFormShape>
  opportunity: Record<K, OpportunityFormShape>
}

type SaveEventPayload<
  K extends string = string,
  T extends keyof FormState<K> = keyof FormState<K>,
> = {
  id: K
  type: T
  data: DeepPartial<FormState<K>[T][K]>
}

type RemoveEventPayload = Pick<SaveEventPayload, 'id' | 'type'>

const slice = createSlice({
  name: 'form',
  initialState: {
    event: {},
    closeEvent: {},
    opportunity: {},
  } as FormState<string>,
  reducers: {
    saveForm: (state, { payload }: PayloadAction<SaveEventPayload>) => {
      state[payload.type][payload.id] = merge(
        {},
        state[payload.type][payload.id],
        payload.data,
      )
    },
    removeForm: (state, { payload }: PayloadAction<RemoveEventPayload>) => {
      delete state[payload.type][payload.id]
    },
  },
})

const { actions, reducer } = slice

export default reducer

export { actions }

export const selectFormByTypeAndId = createSelector(
  [
    (state: RootState) => state.form,
    (state, type: keyof FormState) => type,
    (state, type, id: string) => id,
  ],
  (form, type, id) => form[type][id],
)
