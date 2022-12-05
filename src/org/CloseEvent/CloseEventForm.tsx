import { cloneDeep, mergeWith } from 'lodash'
import merge from 'lodash/merge'
import pick from 'lodash/pick'
import { FieldErrorsImpl, useForm } from 'react-hook-form'
import type { DeepPick } from 'ts-deep-pick'
import { Optional } from 'utility-types'
import {
  Event,
  EventPhoto,
  Finance,
  FinanceReceipt,
  PatchedEvent,
  Record,
} from '../../app/services/bisTypes'
import {
  SimpleStep as Step,
  SimpleSteps as Steps,
} from '../../components/Steps'
import { useShowMessage } from '../../features/systemMessage/useSystemMessage'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from '../../hooks/persistForm'
import { pickErrors, withOverwriteArray } from '../../utils/helpers'
import EvidenceStep from './EvidenceStep'
import ParticipantsStep from './ParticipantsStep'

export type CloseEventPayload = DeepPick<
  PatchedEvent,
  'is_complete' | 'record' | 'finance.bank_account_number'
> & {
  photos: Optional<EventPhoto, 'id'>[]
  receipts: Optional<FinanceReceipt, 'id'>[]
}

// Forms setup
export type EvidenceStepFormShape = {
  record: Pick<
    Record,
    'total_hours_worked' | 'comment_on_work_done' | 'attendance_list'
  >
  finance: Pick<Finance, 'bank_account_number'>
} & {
  photos: Optional<EventPhoto, 'id'>[]
  receipts: Optional<FinanceReceipt, 'id'>[]
}

export type ParticipantsStepFormShape = {
  record: Pick<
    Record,
    | 'participants'
    | 'number_of_participants'
    | 'number_of_participants_under_26'
  >
  includeList: boolean
}

export type CloseEventFormShape = EvidenceStepFormShape &
  ParticipantsStepFormShape

const pickEvidenceData = (data: Partial<CloseEventFormShape>) =>
  pick(
    data,
    'record.total_hours_worked',
    'record.comment_on_work_done',
    'record.attendance_list',
    'finance.bank_account_number',
    'photos',
    'receipts',
  )

const pickParticipantsData = (data: Partial<CloseEventFormShape>) =>
  pick(
    data,
    'record.participants',
    'record.number_of_participants',
    'record.number_of_participants_under_26',
    'includeList',
  )

const formData2payload = ({
  includeList,
  is_complete,
  ...data
}: CloseEventFormShape & { is_complete: boolean }): CloseEventPayload => {
  const payload = cloneDeep(data)

  if (includeList) {
    payload.record.number_of_participants = null
    payload.record.number_of_participants_under_26 = null
  }

  if (payload.finance && !payload.finance.bank_account_number)
    payload.finance.bank_account_number = ''

  return merge(is_complete ? { is_complete: true } : {}, payload)
}

const CloseEventForm = ({
  event,
  initialData,
  onSubmit,
  onCancel,
  id,
}: {
  event: Event
  initialData: Partial<CloseEventFormShape>
  onSubmit: (data: CloseEventPayload) => void
  onCancel: () => void
  id: string
}) => {
  if (
    event.group.slug === 'other' &&
    event.record?.participants?.length &&
    !event.record?.number_of_participants &&
    !event.record?.number_of_participants_under_26
  ) {
    initialData.includeList = true
  }
  // load persisted data
  const savedData = usePersistentFormData('closeEvent', id)
  const initialAndSavedData = merge({}, initialData, savedData)

  const evidenceFormMethods = useForm<EvidenceStepFormShape>({
    defaultValues: pickEvidenceData(initialAndSavedData),
  })
  const participantsFormMethods = useForm<ParticipantsStepFormShape>({
    defaultValues: pickParticipantsData(initialAndSavedData),
  })

  const showMessage = useShowMessage()

  usePersistForm(
    'closeEvent',
    id,
    evidenceFormMethods.watch,
    participantsFormMethods.watch,
  )

  const isVolunteering = event.category.slug === 'public__volunteering'

  // attendance list is required when the event is camp or weekend event
  const areParticipantsRequired = ['camp', 'weekend_event'].includes(
    event.group.slug,
  )
  // but we actually have a field that keeps this info
  // const areParticipantsRequired = event.is_attendance_list_required ?? false

  const handleSubmit = async ({ is_complete }: { is_complete: boolean }) => {
    // let's validate both forms and get data from them
    // then let's send the data to API
    // then let's clear the redux persistent state
    // then redirect to the event page, or event record page, or whatever
    let evidence: EvidenceStepFormShape = {} as EvidenceStepFormShape
    let participants: ParticipantsStepFormShape =
      {} as ParticipantsStepFormShape
    let isValid = true
    let evidenceErrors: FieldErrorsImpl<EvidenceStepFormShape> = {}
    let participantsErrors: FieldErrorsImpl<ParticipantsStepFormShape> = {}
    await Promise.all([
      evidenceFormMethods.handleSubmit(
        data => {
          evidence = data
        },
        errors => {
          isValid = false
          evidenceErrors = errors
        },
      )(),
      participantsFormMethods.handleSubmit(
        data => {
          participants = data
        },
        errors => {
          isValid = false
          participantsErrors = errors
        },
      )(),
    ])

    if (isValid) {
      const data = mergeWith(
        {},
        evidence,
        participants,
        { is_complete },
        {
          photos: evidence.photos.filter(photo => photo.photo),
          receipts: evidence.receipts.filter(receipt => receipt.receipt),
        },
        withOverwriteArray,
      )

      if (
        String(data.record.total_hours_worked) === '' ||
        data.record.total_hours_worked === null
      )
        delete data.record.total_hours_worked

      // don't save the attendance list scan if it wasn't changed
      if (data.record.attendance_list === initialData.record?.attendance_list)
        delete data.record.attendance_list

      await onSubmit(formData2payload(data))
      clearPersist()
    } else {
      // TODO make nicer
      showMessage({
        type: 'error',
        message: 'Opravte, prosím, chyby ve validaci',
        detail: JSON.stringify(
          pickErrors(merge({}, evidenceErrors, participantsErrors)),
        ),
      })
    }
  }

  const clearPersist = useClearPersistentForm('closeEvent', id)

  const handleCancel = () => {
    // evidenceFormMethods.reset(pickEvidenceData(initialData))
    // participantsFormMethods.reset(pickParticipantsData(initialData))
    clearPersist()
    onCancel()
  }

  return (
    <Steps
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      actions={[
        { name: 'uložit', props: { is_complete: false } },
        { name: 'uložit a uzavřít', props: { is_complete: true } },
      ]}
    >
      <Step
        name="účastníci"
        hasError={
          Object.keys(participantsFormMethods.formState.errors).length > 0
        }
      >
        <ParticipantsStep
          areParticipantsRequired={areParticipantsRequired}
          methods={participantsFormMethods}
          event={event}
        />
      </Step>
      <Step
        name="práce"
        hasError={Object.keys(evidenceFormMethods.formState.errors).length > 0}
      >
        <EvidenceStep
          isVolunteering={isVolunteering}
          methods={evidenceFormMethods}
        />
      </Step>
    </Steps>
  )
}

export default CloseEventForm
