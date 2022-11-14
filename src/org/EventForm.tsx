import type { LatLngTuple } from 'leaflet'
import merge from 'lodash/merge'
import { FC, FormEventHandler, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Assign, Optional } from 'utility-types'
import { api, CorrectLocation, EventPayload } from '../app/services/bis'
import {
  EventPhoto,
  EventPropagationImage,
  FinanceReceipt,
  Question,
} from '../app/services/testApi'
import Loading from '../components/Loading'
import { NewLocation } from '../components/SelectLocation'
import { Step, Steps } from '../components/Steps'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from '../hooks/persistForm'
import { joinDateTime } from '../utils/helpers'
import BasicInfoStep from './EventForm/steps/BasicInfoStep'
import EventCategoryStep from './EventForm/steps/EventCategoryStep'
import EventDetailsStep from './EventForm/steps/EventDetailsStep'
import IntendedForStep from './EventForm/steps/IntendedForStep'
import LocationStep from './EventForm/steps/LocationStep'
import OrganizerStep from './EventForm/steps/OrganizerStep'
import ParticipantsStep from './EventForm/steps/ParticipantsStep'
import PropagationStep from './EventForm/steps/PropagationStep'
import RegistrationStep from './EventForm/steps/RegistrationStep'
import WorkStep from './EventForm/steps/WorkStep'

export type EventFormShape = Assign<
  EventPayload,
  {
    questions: Optional<Question, 'id' | 'order'>[]
    main_image?: Optional<EventPropagationImage, 'id' | 'order'>
    images: Optional<EventPropagationImage, 'id' | 'order'>[]
    recordData: {
      photos: Optional<EventPhoto, 'id'>[]
      receipts: Optional<FinanceReceipt, 'id'>[]
    }
    location: NewLocation | Pick<CorrectLocation, 'id'>
    startDate: string
    startTime: string
  }
>

const EventForm: FC<{
  initialData?: Partial<EventFormShape>
  onSubmit: (data: EventFormShape) => Promise<void>
  onCancel: () => void
  eventToEdit: boolean
  id: string
}> = ({ onSubmit, onCancel, initialData, eventToEdit, id }) => {
  let i = 0

  const persistedData = usePersistentFormData('event', id)

  const formMethods = useForm<EventFormShape>({
    defaultValues: merge(
      {},
      initialData,
      {
        finance: null,
        record: null,
        is_closed: false,
        // propagation: {
        //   accommodation: '.',
        //   organizers: '.',
        //   working_days: 0,
        // },
      },
      persistedData,
    ),
  })
  const { handleSubmit, watch } = formMethods

  usePersistForm('event', id, watch)

  const gpsInputMethods = useForm<{ gps: string }>()
  const [currentGPS, setCurrentGPS] = useState<LatLngTuple>()

  // we're loading these to make sure that we have the data before we try to render the form, to make sure that the default values are properly initialized
  // TODO check whether this is necessary
  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: groups } = api.endpoints.getEventGroups.useQuery()
  const { data: programs } = api.endpoints.getPrograms.useQuery()
  const { data: intendedFor } = api.endpoints.getIntendedFor.useQuery()
  const { data: diets } = api.endpoints.getDiets.useQuery()
  const { data: administrationUnits } =
    api.endpoints.getAdministrationUnits.useQuery({ pageSize: 2000 })
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const handleCurrentGpsChange = (gps: LatLngTuple) => {
    setCurrentGPS(gps)
    gpsInputMethods.setValue('gps', gps.join(', '))
  }

  const cancelPersist = useClearPersistentForm('event', id)

  if (
    !(
      groups &&
      diets &&
      programs &&
      categories &&
      intendedFor &&
      allQualifications &&
      administrationUnits
    )
  )
    return <Loading>Připravujeme formulář</Loading>

  const handleFormSubmit = handleSubmit(async data => {
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
    data.start = joinDateTime(data.startDate, data.startTime)
    await onSubmit(data)
    cancelPersist()
  })

  const handleFormReset: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    // formMethods.reset(initialData) // this doesn't reset when initialData is empty, but triggers unnecessary watch
    cancelPersist()
    onCancel()
  }

  const handleGpsInputSubmit = gpsInputMethods.handleSubmit(data => {
    if (!data.gps.trim()) return setCurrentGPS(undefined)
    const [lat, lng] = data.gps!.split(/,\s+/)
    setCurrentGPS([+lat, +lng])
  })

  return (
    <div>
      <form id="gpsInputForm" onSubmit={handleGpsInputSubmit} />
      <FormProvider {...formMethods}>
        <form onSubmit={handleFormSubmit} onReset={handleFormReset}>
          <Steps>
            <Step name="kategorie akce" fields={['group']}>
              <EventCategoryStep />
            </Step>
            <Step
              name="základní info"
              fields={[
                'name',
                'start',
                'end',
                'number_of_sub_events',
                'category',
                'program',
                'administration_units',
              ]}
            >
              <BasicInfoStep />
            </Step>
            <Step
              name="pro koho"
              fields={[
                'intended_for',
                'propagation.vip_propagation.goals_of_event',
                'propagation.vip_propagation.program',
                'propagation.vip_propagation.short_invitation_text',
                'propagation.vip_propagation.rover_propagation',
              ]}
            >
              <IntendedForStep />
            </Step>
            <Step
              name="přihlášení"
              fields={[
                'is_internal',
                'propagation.is_shown_on_web',
                'registration',
              ]}
            >
              <RegistrationStep />
            </Step>
            <Step name="lokace" fields={['location']}>
              <LocationStep
                i={i++}
                gpsInputMethods={gpsInputMethods}
                currentGPS={currentGPS}
                onCurrentGPSChange={handleCurrentGpsChange}
              />
            </Step>
            <Step
              name="info pro účastníky"
              fields={[
                'propagation.cost',
                'propagation.minimum_age',
                'propagation.maximum_age',
                'propagation.accommodation',
                'propagation.diets',
                'propagation.working_hours',
                'propagation.working_days',
                'propagation.contact_person',
                'propagation.contact_name',
                'propagation.contact_email',
                'propagation.contact_phone',
                'propagation.web_url',
              ]}
            >
              <PropagationStep />
            </Step>
            <Step
              name="detaily akce"
              fields={[
                'internal_note',
                'propagation.invitation_text_introduction',
                'propagation.invitation_text_practical_information',
                'propagation.invitation_text_work_description',
                'propagation.invitation_text_about_us',
                'main_image',
                'images',
              ]}
            >
              <EventDetailsStep />
            </Step>
            <Step name="organizátorský tým">
              <OrganizerStep />
              <input type="submit" value="Submit" />
              <input type="reset" value="Reset" />
            </Step>
            <Step name="ucastnici" hidden={!eventToEdit}>
              {initialData?.id && <ParticipantsStep eventId={initialData.id} />}
            </Step>
            <Step name="práce" hidden={!eventToEdit}>
              <WorkStep />
            </Step>
          </Steps>
        </form>
      </FormProvider>
    </div>
  )
}

export default EventForm
