import { skipToken } from '@reduxjs/toolkit/dist/query'
import type { LatLngTuple } from 'leaflet'
import merge from 'lodash/merge'
import { FC, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Optional } from 'utility-types'
import { api, EventPayload } from '../app/services/bis'
import {
  EventPhoto,
  EventPropagationImage,
  FinanceReceipt,
  Location,
  Question,
} from '../app/services/testApi'
import { Step, Steps } from '../components/Steps'
import { useDebouncedState } from '../hooks/debouncedState'
import BasicInfoStep from './EventForm/steps/BasicInfoStep'
import EventCategoryStep from './EventForm/steps/EventCategoryStep'
import EventDetailsStep from './EventForm/steps/EventDetailsStep'
import IntendedForStep from './EventForm/steps/IntendedForStep'
import LocationStep from './EventForm/steps/LocationStep'
import OrganizerStep from './EventForm/steps/OrganizerStep'
import PropagationStep from './EventForm/steps/PropagationStep'
import RegistrationStep from './EventForm/steps/RegistrationStep'
import WorkStep from './EventForm/steps/WorkStep'

export type EventFormShape = EventPayload & {
  questions: Optional<Question, 'id' | 'order'>[]
  main_image?: Optional<EventPropagationImage, 'id' | 'order'>
  images: Optional<EventPropagationImage, 'id' | 'order'>[]
  locationData?: Optional<Location, 'id'>
  recordData: {
    photos: Optional<EventPhoto, 'id'>[]
    receipts: Optional<FinanceReceipt, 'id'>[]
  }
}

const EventForm: FC<{
  initialData?: Partial<EventFormShape>
  onSubmit: (data: EventFormShape) => void
  eventToEdit: boolean
}> = ({ onSubmit, initialData, eventToEdit }) => {
  let i = 0
  const formMethods = useForm<EventFormShape>({
    defaultValues: merge(
      {},
      {
        finance: null,
        record: null,
        propagation: {
          accommodation: '.',
          organizers: '.',
          working_days: 0,
        },
      },
      initialData,
    ),
  })

  const { handleSubmit, watch } = formMethods

  const gpsInputMethods = useForm<{ gps: string }>()
  const [currentGPS, setCurrentGPS] = useState<LatLngTuple>()
  const [birthdate, setBirthdate] = useState('')
  const [name, debouncedName, setName] = useDebouncedState(1000, '')
  const [secondName, debouncedSecondName, setSecondName] = useDebouncedState(
    1000,
    '',
  )

  console.log(watch())

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

  // gowniana linijka, ktora pewnie przyniesie problems
  const {
    data: userByBirthdate,
    isLoading: isUserByBirthdateLoading,
    error: rest,
  } = api.endpoints.readUserByBirthdate.useQuery(
    debouncedName && debouncedSecondName && birthdate && birthdate.length === 10
      ? {
          first_name: name,
          last_name: secondName,
          birthday: birthdate,
        }
      : skipToken,
  )

  const handleCurrentGpsChange = (gps: LatLngTuple) => {
    setCurrentGPS(gps)
    gpsInputMethods.setValue('gps', gps.join(', '))
  }

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
    return <div>Loading (event stuff)</div>

  const handleFormSubmit = handleSubmit(data => {
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
    onSubmit(data)
  })

  const handleGpsInputSubmit = gpsInputMethods.handleSubmit(data => {
    if (!data.gps.trim()) return setCurrentGPS(undefined)
    const [lat, lng] = data.gps!.split(/,\s+/)
    setCurrentGPS([+lat, +lng])
  })

  const addUserToRegistered = () => {
    console.log('add user to registered')
  }

  return (
    <div>
      <form id="gpsInputForm" onSubmit={handleGpsInputSubmit} />
      <FormProvider {...formMethods}>
        <form onSubmit={handleFormSubmit}>
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
            <Step name="lokace" fields={['location', 'locationData']}>
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
            </Step>
            <Step name="ucastnici" hidden={!eventToEdit}>
              <div>
                <div>
                  <h3>Prihlaseni</h3>
                  <button>Upload from file</button>
                  <div>
                    Novy prihlaseny
                    <input
                      placeholder="Jmeno"
                      onChange={e => {
                        setName(e.target.value)
                        if (
                          name !== '' &&
                          secondName !== '' &&
                          birthdate !== ''
                        ) {
                          console.log('get data')
                        }
                      }}
                    ></input>
                    {/** TODO: move to a separate component and use in Ucastnici */}
                    <input
                      placeholder="Prijmeni"
                      onChange={e => setSecondName(e.target.value)}
                    ></input>
                    <input
                      placeholder="Data narozeni"
                      onChange={e => setBirthdate(e.target.value)}
                    ></input>
                    {userByBirthdate && (
                      <div>
                        NAME: {userByBirthdate?.first_name}
                        <button onClick={addUserToRegistered}>+</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3>Ucastnici</h3>
                  <button>Upload from file</button>
                  <div>
                    Novy ucastnik
                    <input placeholder="Jmeno"></input>
                    <input placeholder="Prijmeni"></input>
                    <input placeholder="Data narozeni"></input>
                  </div>
                </div>
              </div>
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
