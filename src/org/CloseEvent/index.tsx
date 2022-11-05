import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../app/services/bis'
import { Event, Finance } from '../../app/services/testApi'
import Loading from '../../components/Loading'
import CloseEventForm, { CloseEventFormShape } from './CloseEventForm'

const CloseEvent = () => {
  const params = useParams()
  const eventId = Number(params.eventId)
  const navigate = useNavigate()

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
  }: CloseEventFormShape & Pick<Event, 'is_closed'>) => {
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

    navigate(`/org/akce/${eventId}`)
  }

  const handleCancel = () => {
    navigate(`/org/akce/${eventId}`)
  }

  return (
    <CloseEventForm
      id={String(eventId)}
      event={event}
      initialData={defaultValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

export default CloseEvent
