import merge from 'lodash/merge'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Optional } from 'utility-types'
import { api } from '../../app/services/bis'
import {
  Event,
  EventPhoto,
  Finance,
  FinanceReceipt,
  Record,
} from '../../app/services/testApi'
import Loading from '../../components/Loading'
import {
  SimpleStep as Step,
  SimpleSteps as Steps,
} from '../../components/Steps'
import EvidenceStep from './EvidenceStep'
import ParticipantsStep from './ParticipantsStep'

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

export type CloseEventFormShape = EvidenceStepFormShape &
  ParticipantsStepFormShape

const CloseEvent = () => {
  const params = useParams()
  const eventId = Number(params.eventId)

  const { data: event } = api.endpoints.readEvent.useQuery({ id: eventId })
  const { data: photos } = api.endpoints.readEventPhotos.useQuery({
    eventId,
  })
  const { data: receipts } = api.endpoints.readFinanceReceipts.useQuery({
    eventId,
  })

  const [updateEvent] = api.endpoints.updateEvent.useMutation()
  const [createPhoto] = api.endpoints.createEventPhoto.useMutation()
  const [updatePhoto] = api.endpoints.updateEventPhoto.useMutation()
  const [deletePhoto] = api.endpoints.deleteEventPhoto.useMutation()
  const [createReceipt] = api.endpoints.createFinanceReceipt.useMutation()
  const [updateReceipt] = api.endpoints.updateFinanceReceipt.useMutation()
  const [deleteReceipt] = api.endpoints.deleteFinanceReceipt.useMutation()

  if (!(event && photos && receipts)) return <Loading>Stahujeme data</Loading>

  const defaultValues = {
    record: {
      ...event.record,
      photos: photos.results.map(({ photo, ...rest }) => ({
        photo: photo.original,
        ...rest,
      })),
    },
    finance: {
      ...event.finance,
      receipts: receipts.results,
    },
  }

  const handleSubmit = async ({
    is_closed,
    record: { photos, ...record },
    finance: { receipts, ...finance },
  }: EvidenceStepFormShape &
    ParticipantsStepFormShape &
    Pick<Event, 'is_closed'>) => {
    // update record
    const dataToSave: Pick<Event, 'record' | 'is_closed' | 'finance'> = {
      record,
      finance: finance as Finance,
      is_closed,
    }

    if (!dataToSave.is_closed) delete dataToSave.is_closed
    if (!dataToSave.finance?.bank_account_number)
      delete dataToSave.finance?.bank_account_number

    await updateEvent({ id: eventId, event: dataToSave }).unwrap()

    /**
     * Event Photos
     */
    // create each new photo
    const createdPhotoPromises = photos
      // find only new photos...
      .filter(photo => !photo.id)
      // ...and create them via api
      .map(eventPhoto => createPhoto({ eventId, eventPhoto }).unwrap())
    // update each changed photo
    const updatedPhotoPromises = photos
      // find only changed photos...
      .filter(p =>
        Boolean(
          defaultValues.record.photos.find(
            ({ photo, id }) => id === p.id && photo !== p.photo,
          ),
        ),
      )
      // ...and update them via api
      .map(eventPhoto =>
        updatePhoto({
          eventId,
          id: eventPhoto.id as number,
          patchedEventPhoto: eventPhoto,
        }).unwrap(),
      )
    // delete each removed photo
    const deletedPhotoPromises = defaultValues.record.photos
      // find all removed photos...
      .filter(p => photos.findIndex(({ id }) => p.id === id) === -1)
      // ...and delete them via api
      .map(({ id }) =>
        deletePhoto({
          eventId,
          id: id as number,
        }).unwrap(),
      )
    // and wait for all the photo api requests to finish
    await Promise.all([
      ...createdPhotoPromises,
      ...updatedPhotoPromises,
      ...deletedPhotoPromises,
    ])

    /**
     * Finance Receipts
     */

    const createdReceiptPromises = receipts
      // find only new receipts...
      .filter(receipt => !receipt.id)
      // ...and create them via api
      .map(financeReceipt =>
        createReceipt({ eventId, financeReceipt }).unwrap(),
      )
    // update each changed receipt
    const updatedReceiptPromises = receipts
      // find only changed receipts...
      .filter(p =>
        Boolean(
          defaultValues.finance.receipts.find(
            ({ receipt, id }) => id === p.id && receipt !== p.receipt,
          ),
        ),
      )
      // ...and update them via api
      .map(financeReceipt =>
        updateReceipt({
          eventId,
          id: financeReceipt.id as number,
          patchedFinanceReceipt: financeReceipt,
        }).unwrap(),
      )
    // delete each removed receipt
    const deletedReceiptPromises = defaultValues.finance.receipts
      // find all removed receipts...
      .filter(p => receipts.findIndex(({ id }) => p.id === id) === -1)
      // ...and delete them via api
      .map(({ id }) =>
        deleteReceipt({
          eventId,
          id: id as number,
        }).unwrap(),
      )
    // and wait for all the receipt api requests to finish
    await Promise.all([
      ...createdReceiptPromises,
      ...updatedReceiptPromises,
      ...deletedReceiptPromises,
    ])
  }

  return (
    <CloseEventForm
      event={event}
      initialData={defaultValues}
      onSubmit={handleSubmit}
    />
  )
}

export default CloseEvent

const CloseEventForm = ({
  event,
  initialData,
  onSubmit,
}: {
  event: Event
  initialData: Partial<EvidenceStepFormShape & ParticipantsStepFormShape>
  onSubmit: (
    data: EvidenceStepFormShape &
      ParticipantsStepFormShape &
      Pick<Event, 'is_closed'>,
  ) => void
}) => {
  const evidenceFormMethods = useForm<EvidenceStepFormShape>({
    defaultValues: omit(
      pick(
        initialData,
        'record',
        'finance.bank_account_number',
        'finance.receipts',
      ),
      'record.participants',
      'record.number_of_participants',
      'record.number_of_participants_under_26',
    ),
  })
  const participantsFormMethods = useForm<ParticipantsStepFormShape>({
    defaultValues: pick(
      initialData,
      'record.participants',
      'record.number_of_participants',
      'record.number_of_participants_under_26',
    ),
  })

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
    await Promise.all([
      evidenceFormMethods.handleSubmit(
        data => {
          evidence = data
        },
        () => {
          isValid = false
        },
      )(),
      participantsFormMethods.handleSubmit(
        data => {
          participants = data
        },
        () => {
          isValid = false
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

      onSubmit(data)
    } else {
      // TODO make nicer
      alert('please fix validation errors')
    }
  }

  return (
    <Steps
      onSubmit={handleSubmit}
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
        <ParticipantsStep
          areParticipantsRequired={areParticipantsRequired}
          methods={participantsFormMethods}
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
