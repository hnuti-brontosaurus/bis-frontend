import merge from 'lodash/merge'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import { FieldErrorsImpl, useForm } from 'react-hook-form'
import { Optional } from 'utility-types'
import {
  Event,
  EventPhoto,
  Finance,
  FinanceReceipt,
  Record,
} from '../../app/services/testApi'
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
import { pickErrors } from '../../utils/helpers'
import ParticipantsStep from '../EventForm/steps/ParticipantsStep'
import EvidenceStep from './EvidenceStep'
import ParticipantsStepWIP from './ParticipantsStep'

// Forms setup
export type EvidenceStepFormShape = {
  record: Omit<
    Record,
    | 'participants'
    | 'number_of_participants'
    | 'number_of_participants_under_26'
  > & {
    photos: Optional<EventPhoto, 'id'>[]
  }
  finance: Pick<Finance, 'bank_account_number'> & {
    receipts: Optional<FinanceReceipt, 'id'>[]
  }
}

export type ParticipantsStepFormShape = {
  record: Pick<
    Record,
    | 'participants'
    | 'number_of_participants'
    | 'number_of_participants_under_26'
  >
}

const pickEvidenceData = (data: Partial<CloseEventFormShape>) =>
  omit(
    pick(data, 'record', 'finance.bank_account_number', 'finance.receipts'),
    'record.participants',
    'record.number_of_participants',
    'record.number_of_participants_under_26',
  )

const pickParticipantsData = (data: Partial<CloseEventFormShape>) =>
  pick(
    data,
    'record.participants',
    'record.number_of_participants',
    'record.number_of_participants_under_26',
  )

export type CloseEventFormShape = EvidenceStepFormShape &
  ParticipantsStepFormShape

const CloseEventForm = ({
  event,
  initialData,
  onSubmit,
  onCancel,
  id,
}: {
  event: Event
  initialData: Partial<CloseEventFormShape>
  onSubmit: (data: CloseEventFormShape & Pick<Event, 'is_closed'>) => void
  onCancel: () => void
  id: string
}) => {
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

  const isVolunteering = [
    'public__volunteering__only_volunteering',
    'public__volunteering__with_experience',
  ].includes(event.category.slug)

  // attendance list is required when the event is camp or weekend event
  // const areParticipantsRequired = ['camp', 'weekend_event'].includes(
  //   event.group.slug,
  // )
  // but we actually have a field that keeps this info
  const areParticipantsRequired = event.is_attendance_list_required ?? false

  const handleSubmit = async ({ is_closed }: { is_closed: boolean }) => {
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
      const data = merge(
        {},
        omit(evidence, 'record.photos', 'finance.receipts'),
        participants,
        { is_closed },
        {
          record: {
            photos: evidence.record.photos.filter(photo => photo.photo),
          },
          finance: {
            receipts: evidence.finance.receipts.filter(
              receipt => receipt.receipt,
            ),
          },
        },
      )

      if (
        String(data.record.total_hours_worked) === '' ||
        data.record.total_hours_worked === null
      )
        delete data.record.total_hours_worked

      // don't save the attendance list scan if it wasn't changed
      if (data.record.attendance_list === initialData.record?.attendance_list)
        delete data.record.attendance_list

      await onSubmit(data)
      clearPersist()
    } else {
      // TODO make nicer
      showMessage({
        message: 'Opravte, prosím, chyby ve validaci',
        type: 'error',
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
        { name: 'uložit', props: { is_closed: false } },
        { name: 'uložit a uzavřít', props: { is_closed: true } },
      ]}
    >
      <Step
        name="účastníci"
        hasError={
          Object.keys(participantsFormMethods.formState.errors).length > 0
        }
      >
        <ParticipantsStepWIP
          areParticipantsRequired={areParticipantsRequired}
          methods={participantsFormMethods}
        />
        <ParticipantsStep eventId={event.id} />
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
