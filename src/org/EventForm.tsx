import { skipToken } from '@reduxjs/toolkit/dist/query'
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
  User,
} from '../app/services/testApi'
import Loading from '../components/Loading'
import Modal from '../components/NewApplicationModal'
import { NewLocation } from '../components/SelectLocation'
import { SelectUser } from '../components/SelectUsers'
import { Step, Steps } from '../components/Steps'
import { useDebouncedState } from '../hooks/debouncedState'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from '../hooks/persistForm'
import { joinDateTime } from '../utils/helpers'
import styles from './EventForm.module.scss'
import BasicInfoStep from './EventForm/steps/BasicInfoStep'
import EventCategoryStep from './EventForm/steps/EventCategoryStep'
import EventDetailsStep from './EventForm/steps/EventDetailsStep'
import IntendedForStep from './EventForm/steps/IntendedForStep'
import LocationStep from './EventForm/steps/LocationStep'
import OrganizerStep from './EventForm/steps/OrganizerStep'
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
  const [openNewApplicationModal, setOpenNewApplicationModal] =
    useState<boolean>(false)

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

  /* PO AKCI step START*/

  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [birthdate, setBirthdate] = useState<string>()

  const [searchQuery, debouncedSearchQuery, setSearchQuery] = useDebouncedState(
    1000,
    '',
  )

  const { data: userOptions, isLoading: isOptionsLoading } =
    api.endpoints.readUsers.useQuery(
      debouncedSearchQuery.length >= 2
        ? {
            search: debouncedSearchQuery,
          }
        : skipToken,
    )

  const [patchEvent, { isLoading: isPatchingEvent }] =
    api.endpoints.updateEvent.useMutation()

  const [newParticipant, setNewParticipant] = useState<
    number | { value: number; label: string } | undefined
  >()

  const [newParticipantBirthdate, setNewParticipantBirthdate] =
    useState<string>('')
  const { data: applications, isLoading: isReadApplicationsLoading } =
    api.endpoints.readEventApplications.useQuery(
      initialData && initialData.id
        ? {
            eventId: initialData.id.toString(),
            pageSize: 10000,
          }
        : skipToken,
    )

  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery(
      initialData && initialData.id
        ? {
            eventId: initialData.id,
          }
        : skipToken,
    )

  const addSelectedUser = async (
    participant: { label: string; value: number } | number,
    newParticipantBirthdate: string,
  ) => {
    console.log('patch')

    if (typeof participant !== 'number') {
      // let newParticipants = participants
      //   ? participants.results.map(p => p.id)
      //   : []
      let newParticipants = []
      newParticipants.push(participant.value)

      await patchEvent({
        id: initialData?.id || 0,
        event: {
          record: {
            participants: newParticipants,
          },
        },
      })
    }
  }
  const [createEventApplication, { isLoading: isSavingOpportunity }] =
    api.endpoints.createEventApplication.useMutation()

  const handleOnAddRegisteredClick = (user: User) => {
    openAddUserToApplicationsForm()

    if (initialData?.id) {
      createEventApplication({
        user: {
          ...user,
          close_person: {
            first_name: 'mama',
            last_name: 'moja',
            email: 'mama@example.com',
          },
          email: 'ja@example.com',
          address: {
            city: 'my city',
            street: 'my street',
            zip_code: '23434',
            region: { id: 1, name: 'Praha' },
          },
        },
        eventId: initialData.id,
      })
    }
  }

  /* PO AKCI step END*/

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

  const addUserToRegistered = () => {
    console.log('add user to registered')
  }

  const openAddApplicationForm = () => {
    setOpenNewApplicationModal(true)
  }

  const openAddUserToApplicationsForm = () => {
    console.log('open user form')
  }
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
              <div className={styles.participantsContainer}>
                <div className={styles.ListContainer}>
                  <h2>Prihlaseni</h2>
                  <button type="button">Export do csv</button>
                  <button type="button">Tisknij prezencni listinu</button>
                  <div className={styles.searchForm}>
                    <div className={styles.inputGroup}>
                      <input
                        placeholder="Jmeno"
                        value={firstName}
                        onChange={e => {
                          setFirstName(e.target.value)
                          setSearchQuery(`${e.target.value} ${lastName || ''}`)
                        }}
                      ></input>
                      <input
                        placeholder="Prijmeni"
                        value={lastName}
                        onChange={e => {
                          setLastName(e.target.value)
                          setSearchQuery(`${firstName || ''} ${e.target.value}`)
                        }}
                      ></input>
                    </div>
                    {userOptions?.results?.map((o: User) => {
                      return (
                        <div>
                          {`${o.display_name}`}
                          <button
                            type="button"
                            onClick={() => handleOnAddRegisteredClick(o)}
                          >
                            +
                          </button>
                        </div>
                      )
                    })}
                    {!birthdate &&
                      userOptions &&
                      userOptions.results.length === 0 && (
                        <div>
                          Uzivatel o tym jmene a prujmeni neni Pridaj datum
                          narozeni aby zobrazit toho uzivatela anebo{' '}
                          <button>Pridaj noveho uzivatele</button>
                        </div>
                      )}
                  </div>
                  <div>
                    {/* <button type="button" onClick={openAddApplicationForm}>
                      Add new applicant
                    </button> */}

                    {applications &&
                      applications.results &&
                      applications.results.map(application => (
                        <>
                          <div>{application.id}</div>
                          <div>{application.first_name}</div>
                        </>
                      ))}
                  </div>
                </div>
                <div className={styles.ListContainer}>
                  <h2>Ucastnici</h2>
                  <button type="button">Upload from file</button>
                  <div className={styles.searchForm}>
                    <div className={styles.inputGroup}>
                      <input
                        placeholder="Jmeno"
                        onChange={e => {
                          setFirstName(e.target.value)
                          setSearchQuery(`${e.target.value}`)
                        }}
                      ></input>
                      <input placeholder="Prijmeni"></input>
                      <input placeholder="Datum narozeni"></input>
                    </div>
                    {}
                  </div>
                  <div>
                    Novy ucastnik
                    <SelectUser
                      onChange={e => {
                        console.log(e)
                        setNewParticipant(e || undefined)
                      }}
                      fullData
                    />
                    {newParticipant ? (
                      <div>
                        {`jest uzytkownik: ${
                          typeof newParticipant !== 'number' &&
                          newParticipant.label
                        }
                        `}
                        <input
                          onChange={e => {
                            setNewParticipantBirthdate(e.target.value)
                          }}
                        ></input>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()

                            addSelectedUser(
                              newParticipant,
                              newParticipantBirthdate,
                            )
                          }}
                        >
                          Add this user
                        </button>
                      </div>
                    ) : (
                      <button type="button"> add new user</button>
                    )}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()

                        addSelectedUser(
                          { value: 1, label: 'dzik' },
                          newParticipantBirthdate,
                        )
                      }}
                    >
                      Add this user
                    </button>
                  </div>
                  {participants &&
                    participants.results &&
                    participants.results.map(participant => (
                      <>
                        <div>{participant.id}</div>
                        <div>{participant.first_name}</div>
                      </>
                    ))}
                  {}
                </div>
              </div>
            </Step>
            <Step name="práce" hidden={!eventToEdit}>
              <WorkStep />
            </Step>
          </Steps>
        </form>
      </FormProvider>
      <Modal
        open={openNewApplicationModal}
        onClose={() => {
          setOpenNewApplicationModal(false)
        }}
        onSubmit={() => {}}
        data={initialData || {}}
      ></Modal>
    </div>
  )
}

export default EventForm
