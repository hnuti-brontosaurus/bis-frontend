import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import mergeWith from 'lodash/mergeWith'
import { DeepPartial, ValuesType } from 'utility-types'
import { RootState } from '../../app/store'
import { RegistrationFormShapeWithStep } from '../../EventRegistrationForm'
import { CloseEventFormShape } from '../../org/CloseEvent/CloseEventForm'
import { EventFormShape } from '../../org/EventForm'
import { OpportunityFormShape } from '../../org/OpportunityForm'
import { UserForm } from '../../user/EditProfile'
import { withOverwriteArray } from '../../utils/helpers'

export type FormState<K extends string = string> = {
  event: Record<K, EventFormShape>
  closeEvent: Record<K, CloseEventFormShape>
  opportunity: Record<K, OpportunityFormShape>
  registration: Record<K, RegistrationFormShapeWithStep>
  user: Record<K, UserForm>
}

export type PersistentFormType =
  | 'event'
  | 'closeEvent'
  | 'opportunity'
  | 'registration'
  | 'user'

export type PersistentFormValue<K extends PersistentFormType> = ValuesType<
  FormState[K]
>

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
    registration: {},
    user: {},
  } as FormState<string>,
  reducers: {
    saveForm: (state, { payload }: PayloadAction<SaveEventPayload>) => {
      state[payload.type][payload.id] = mergeWith(
        {},
        state[payload.type][payload.id],
        payload.data,
        withOverwriteArray,
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
