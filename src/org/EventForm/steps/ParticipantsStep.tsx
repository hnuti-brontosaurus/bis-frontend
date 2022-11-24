import { skipToken } from '@reduxjs/toolkit/dist/query'
import { FC, useState } from 'react'
import type { Assign, Optional } from 'utility-types'
import { api, CorrectLocation, EventPayload } from '../../../app/services/bis'
import {
  EventPhoto,
  EventPropagationImage,
  FinanceReceipt,
  Question,
  User,
} from '../../../app/services/testApi'
import AddParticipantModal from '../../../components/AddParticipantModal'
import Loading from '../../../components/Loading'
import NewApplicationModal from '../../../components/NewApplicationModal'
import { NewLocation } from '../../../components/SelectLocation'
import { SelectUser } from '../../../components/SelectUsers'
import { useDebouncedState } from '../../../hooks/debouncedState'
// TODO: przenisc tu style bo Michal
import styles from '../../EventForm.module.scss'

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

const ParticipantsStep: FC<{
  eventId: number
}> = ({ eventId }) => {
  const [openNewApplicationModal, setOpenNewApplicationModal] =
    useState<boolean>(false)
  const [openAddParticipantModal, setOpenAddParticipantModal] =
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

  const [currentApplicationId, setCurrentApplicationId] = useState<number>()

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
    string | { value: string; label: string } | undefined
  >()
  const [deleteEventApplication] =
    api.endpoints.deleteEventApplication.useMutation()

  const { data: currentApplication } =
    api.endpoints.readEventApplication.useQuery(
      eventId && currentApplicationId
        ? {
            eventId,
            applicationId: currentApplicationId,
          }
        : skipToken,
    )

  const [newParticipantBirthdate, setNewParticipantBirthdate] =
    useState<string>('')
  const { data: applications, isLoading: isReadApplicationsLoading } =
    api.endpoints.readEventApplications.useQuery({
      eventId,
      pageSize: 10000,
    })

  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery({ eventId })

  const addSelectedUser = async (
    participant: { label: string; value: string } | string,
    newParticipantBirthdate: string,
  ) => {
    console.log('patch')

    if (typeof participant !== 'string') {
      // let newParticipants = participants
      //   ? participants.results.map(p => p.id)
      //   : []
      let newParticipants = []
      newParticipants.push(participant.value)

      await patchEvent({
        id: eventId,
        event: {
          record: {
            participants: newParticipants,
          },
        },
      })
    }
  }

  const handleOnAddRegisteredClick = (user: User) => {
    openAddUserToApplicationsForm()
  }

  /* PO AKCI step END*/

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

  const openAddUserToApplicationsForm = () => {
    console.log('open user form')
  }
  return (
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
          <button
            type="button"
            onClick={() => {
              setOpenNewApplicationModal(true)
            }}
          >
            Pridaj novou prihlasku
          </button>
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
                <div
                  onClick={async () => {
                    setCurrentApplicationId(application.id)
                    console.log('open application modal', currentApplication)
                  }}
                >
                  {application.first_name}
                </div>
                <div
                  onClick={() => {
                    console.log('delete')
                    deleteEventApplication({
                      applicationId: application.id,
                      eventId,
                    })
                  }}
                >
                  X
                </div>
                <div
                  onClick={() => {
                    console.log('pridaj jako ucastnika')
                    setCurrentApplicationId(application.id)
                    setOpenAddParticipantModal(true)
                  }}
                >
                  Pridaj jako ucastnika
                </div>
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
                typeof newParticipant !== 'string' && newParticipant.label
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

                  addSelectedUser(newParticipant, newParticipantBirthdate)
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
                { value: 'asdf', label: 'dzik' },
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
      <NewApplicationModal
        open={openNewApplicationModal}
        onClose={() => {
          setOpenNewApplicationModal(false)
        }}
        onSubmit={() => {}}
        data={{ id: eventId }}
      ></NewApplicationModal>

      <AddParticipantModal
        open={openAddParticipantModal}
        onClose={() => {
          setOpenNewApplicationModal(false)
        }}
        onSubmit={() => {}}
        data={currentApplication || {}}
      ></AddParticipantModal>
    </div>
  )
}

export default ParticipantsStep
