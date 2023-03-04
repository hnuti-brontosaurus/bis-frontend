import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import type { User, UserPayload } from 'app/services/bisTypes'
import spreadsheetTemplate from 'assets/templates/Vzor_import účastníků.xlsx'
import classNames from 'classnames'
import {
  Actions,
  Button,
  EmptyListPlaceholder,
  ExternalButtonLink,
  ImportExcelButton,
  Loading,
  SelectUnknownUser,
  StyledModal,
  TableCellIconButton,
} from 'components'
import { UserForm } from 'components/UserForm/UserForm'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import { merge } from 'lodash'
import {
  ConfirmedUser,
  ImportParticipantsList,
} from 'org/components/ImportParticipantsList/ImportParticipantsList'
import { FC, useState } from 'react'
import { FaTrash as Bin, FaUserEdit as EditUser } from 'react-icons/fa'
import colors from 'styles/colors.module.scss'
import { Overwrite } from 'utility-types'
import { ApplicationStates } from '../ParticipantsStep'
import styles from '../ParticipantsStep.module.scss'
import { ShowApplicationModal } from './ShowApplicationModal'

// type UserImport = Omit<UserPayload, 'pronoun' | 'all_emails'>

export type UserImport = Overwrite<
  Omit<UserPayload, 'pronoun' | 'subscribed_to_newsletter' | 'all_emails'>,
  { health_insurance_company: string; address: string; contact_address: string }
>

export const Participants: FC<{
  eventId: number
  eventName: string
  chooseHighlightedParticipant: (id: string | undefined) => void
  highlightedParticipant?: string
  participantsMap?: { [s: string]: string[] }
}> = ({
  eventId,
  eventName,
  highlightedParticipant,
  chooseHighlightedParticipant,
  participantsMap,
}) => {
  const [lastAddedId, setLastAddedId] = useState<string>()
  const [timeOfLastAddition, setTimeOfLastAddition] = useState<number>(0)
  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery({ eventId })

  const [showShowApplicationModal, setShowShowApplicationModal] =
    useState<boolean>(false)

  const showMessage = useShowMessage()

  const [currentParticipantId, setCurrentParticipantId] = useState<string>()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { data: membershipCategories } =
    api.endpoints.readMembershipCategories.useQuery({})

  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })

  const { data: currentParticipant } = api.endpoints.readUser.useQuery(
    currentParticipantId ? { id: currentParticipantId } : skipToken,
  )

  const [patchEvent, patchEventStatus] = api.endpoints.updateEvent.useMutation()
  const [createUser, createUserStatus] = api.endpoints.createUser.useMutation()
  const [updateUser, updateUserStatus] = api.endpoints.updateUser.useMutation()
  const [highLightedRow, setHighlightedRow] = useState<string>()

  useShowApiErrorMessage(createUserStatus.error)
  useShowApiErrorMessage(updateUserStatus.error)
  useShowApiErrorMessage(patchEventStatus.error)

  const addParticipant = async (newParticipantId: string) => {
    let newParticipants: string[] = []

    if (participants) {
      newParticipants = participants.results.map(p => p.id)
    }
    newParticipants.push(newParticipantId)

    await patchEvent({
      id: eventId,
      event: {
        record: {
          participants: newParticipants,
          contacts: [],
          number_of_participants: null,
          number_of_participants_under_26: null,
        },
      },
    }).unwrap()

    setLastAddedId(newParticipantId)
    setTimeOfLastAddition(Date.now())
  }

  const [updateApplication] = api.endpoints.updateEventApplication.useMutation()

  const addParticipants = async (newParticipantIds: string[]) => {
    const allParticipants: string[] = []

    if (participants) {
      allParticipants.push(...participants.results.map(p => p.id))
    }
    allParticipants.push(...newParticipantIds)

    await patchEvent({
      id: eventId,
      event: {
        record: {
          participants: allParticipants,
          contacts: [],
          number_of_participants: null,
          number_of_participants_under_26: null,
        },
      },
    }).unwrap()

    newParticipantIds.forEach(id => {
      setLastAddedId(id)
      setTimeOfLastAddition(Date.now())
    })
  }

  /**
   * Handle adding a new participant and updating a participant
   * This is done through a form in modal
   */
  // keep state
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [userModalData, setUserModalData] = useState<User | undefined>()

  const handleCancelUserForm = () => {
    setUserModalOpen(false)
  }

  const handleSubmitUserForm = async (data: UserPayload, id?: string) => {
    // if id is passed, update user
    if (id) {
      await updateUser({ id, patchedUser: data }).unwrap()
      // say that it was success
      showMessage({
        type: 'success',
        message: 'Změny byly uloženy',
      })
    }
    // otherwise create new user and add them as participant
    else {
      const fixedData = merge({ donor: null, offers: null }, data)
      // then we create the user and add them as participant
      const { id: userId } = await createUser(fixedData).unwrap()
      await addParticipant(userId)
      // say that it was success
      showMessage({
        type: 'success',
        message: 'Nový účastník byl úspěšně vytvořen a přidán',
      })
    }
    // and if everything works, close the form
    setUserModalOpen(false)
  }

  const handleClickNewParticipant = () => {
    setUserModalData(undefined)
    setUserModalOpen(true)
  }

  const handleClickEditParticipant = (data: User) => {
    setUserModalData(data)
    setUserModalOpen(true)
  }

  const userModalTitle = userModalData
    ? `Úprava dat účastnice/účastníka ${userModalData.first_name} ${userModalData.last_name}`
    : 'Nový účastník'

  /**
   * Handle removing a participant
   */
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [removeModalData, setRemoveModalData] = useState<User | undefined>()
  const handleClickRemoveParticipant = (data: User) => {
    setRemoveModalData(data)
    setRemoveModalOpen(true)
  }

  const handleCancelRemoveParticipant = () => {
    setRemoveModalOpen(false)
  }

  const handleConfirmRemoveParticipant = async () => {
    try {
      // make array of participants without this one
      const updatedParticipants = participants?.results
        .map(p => p.id)
        .filter(id => id !== removeModalData!.id)
      await patchEvent({
        id: eventId,
        event: {
          record: {
            participants: updatedParticipants,
            contacts: [],
          },
        },
      }).unwrap()

      // make applications assigned to this user 'pending'
      if (
        participantsMap &&
        removeModalData &&
        participantsMap[removeModalData.id]
      ) {
        for (let i of participantsMap[removeModalData.id]) {
          await updateApplication({
            id: Number(i),
            eventId: eventId,
            patchedEventApplication: {
              state: ApplicationStates.pending,
              user: null,
            },
          })
        }
      }

      showMessage({
        type: 'success',
        message: `Uživatel/ka ${removeModalData!.first_name} ${
          removeModalData!.last_name
        } byl/a úspěšně smazán/a ze seznamu účastníků`,
      })
    } finally {
      setRemoveModalOpen(false)
    }
  }

  const [importParticipantsModalOpen, setImportParticipantsModalOpen] =
    useState(false)
  const [importParticipantsData, setImportParticipantsData] =
    useState<UserImport[]>()

  const handleCancelImportParticipants = () => {
    setImportParticipantsModalOpen(false)
    setImportParticipantsData(undefined)
  }

  const handleImportParticipants = async (data: UserImport[]) => {
    setImportParticipantsData(data)
    setImportParticipantsModalOpen(true)
  }

  const handleSaveImportedParticipants = async (data: ConfirmedUser[]) => {
    const existingParticipants = data.filter(
      datum => 'id' in datum && datum.id,
    ) as ({ id: string } & Partial<UserPayload>)[]
    const newParticipantsData = data.filter(
      datum => !('id' in datum && datum.id),
    ) as UserPayload[]

    // create non-existent people
    const newParticipants = await Promise.all(
      newParticipantsData.map(datum => createUser(datum).unwrap()),
    )

    // save participants
    await addParticipants(
      existingParticipants
        .map(p => p.id)
        .concat(newParticipants.map(p => p.id)),
    )

    // update existent people
    await Promise.all(
      existingParticipants.map(async ({ id, ...data }) => {
        await updateUser({ id, patchedUser: data })
      }),
    )

    setImportParticipantsModalOpen(false)
  }

  const removeModalTitle = removeModalData
    ? `Opravdu chcete smazat účastnici/účastníka ${removeModalData.first_name} ${removeModalData.last_name} z akce ${eventName}?`
    : undefined

  return (
    <div className={styles.ListContainer}>
      <StyledModal
        title={userModalTitle}
        open={userModalOpen}
        onClose={handleCancelUserForm}
      >
        <UserForm
          id={(userModalData?.id ?? 'new') + '-participant'}
          initialData={userModalData}
          onCancel={handleCancelUserForm}
          onSubmit={handleSubmitUserForm}
        />
      </StyledModal>
      <StyledModal
        title={removeModalTitle}
        open={removeModalOpen}
        onClose={handleCancelRemoveParticipant}
      >
        <RemoveParticipantConfirmDialog
          onConfirm={handleConfirmRemoveParticipant}
          onCancel={handleCancelRemoveParticipant}
        />
      </StyledModal>
      <StyledModal
        title="Import účastnic a účastníků"
        open={importParticipantsModalOpen}
        onClose={handleCancelImportParticipants}
      >
        <ImportParticipantsList
          data={importParticipantsData}
          onConfirm={handleSaveImportedParticipants}
          onCancel={handleCancelImportParticipants}
        />
      </StyledModal>
      <h2>
        Účastníci{' '}
        <ImportExcelButton<UserImport>
          keyMap={{
            first_name: 0,
            last_name: 1,
            birthday: 2,
            email: 3,
            phone: 4,
            address: 5,
            contact_address: 6,
            health_insurance_company: 7,
            health_issues: 8,
            close_person: {
              first_name: 9,
              last_name: 10,
              email: 11,
              phone: 12,
            },
            birth_name: 13,
            nickname: 14,
          }}
          headerRows={2}
          onUpload={handleImportParticipants}
        >
          Importovat z excelu
        </ImportExcelButton>
        <ExternalButtonLink tertiary href={spreadsheetTemplate}>
          (vzor)
        </ExternalButtonLink>
      </h2>
      {!isReadParticipantsLoading ? (
        <div>
          <div>Přidat účastníka:</div>
          <SelectUnknownUser
            value={selectedUser ?? undefined}
            onChange={async selectedUser => {
              setSelectedUser(selectedUser)
              if (selectedUser) {
                await addParticipant(selectedUser.id)
                setSelectedUser(null)
              }
            }}
            onBirthdayError={message => {
              showMessage({
                type: 'error',
                message: 'Nepodařilo se přidat uživatele',
                detail: message,
              })
            }}
          />
          <Button type="button" secondary onClick={handleClickNewParticipant}>
            Přidat nového účastníka
          </Button>
          {participants && participants.results && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jméno</th>
                  <th>příjmení</th>
                  <th>datum narození</th>
                  <th>
                    <EditUser className={classNames(styles.iconHead)} />
                  </th>
                  <th>
                    <Bin className={classNames(styles.iconHead)}></Bin>
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.results.map((participant: User) => (
                  <tr
                    key={participant.id}
                    className={classNames(
                      highlightedParticipant === participant.id
                        ? styles.highlightedRow
                        : '',
                      lastAddedId === participant.id &&
                        timeOfLastAddition > Date.now() - 30000 &&
                        styles.lightUp,
                      highLightedRow === participant.id
                        ? styles.highlightedRow
                        : '',
                    )}
                    onMouseEnter={() => {
                      setHighlightedRow(participant.id)
                      chooseHighlightedParticipant(participant.id)
                    }}
                    onMouseLeave={() => {
                      setHighlightedRow(undefined)
                      chooseHighlightedParticipant(undefined)
                    }}
                    onClick={() => {
                      setShowShowApplicationModal(true)
                      setCurrentParticipantId(participant.id)
                    }}
                  >
                    <td>
                      {`${participant.first_name}${
                        participant.nickname && `(${participant.nickname})`
                      }`}
                    </td>
                    <td>{participant.last_name}</td>
                    <td>{participant.birthday}</td>
                    <TableCellIconButton
                      icon={EditUser}
                      action={() => handleClickEditParticipant(participant)}
                      tooltipContent="Upravit účastníka"
                      color={colors.yellow}
                      ariaLabel={`Upravit účastníka ${participant.first_name} ${participant.last_name}`}
                    />
                    <TableCellIconButton
                      icon={Bin}
                      action={() => handleClickRemoveParticipant(participant)}
                      tooltipContent="Smazat účastníka"
                      color={colors.error}
                      ariaLabel={`Smazat účastníka ${participant.first_name} ${participant.last_name}`}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {participants?.results?.length === 0 && (
            <EmptyListPlaceholder label="Zatím nebyli přidáni žádní účastníci." />
          )}
        </div>
      ) : (
        <Loading>Stahujeme účastníky</Loading>
      )}
      {currentParticipant && (
        <ShowApplicationModal
          open={showShowApplicationModal}
          onClose={() => {
            setShowShowApplicationModal(false)
            setHighlightedRow(undefined)
          }}
          userId={currentParticipantId}
          currentParticipant={currentParticipant}
          eventName={eventName}
          eventId={eventId}
          categories={membershipCategories?.results ?? []}
          administrationUnits={
            administrationUnits ? administrationUnits.results : []
          }
          participantsMap={participantsMap}
        ></ShowApplicationModal>
      )}
    </div>
  )
}

const RemoveParticipantConfirmDialog = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) => {
  const [saving, setSaving] = useState(false)
  const handleClickConfirm = async () => {
    setSaving(true)
    try {
      await onConfirm()
    } finally {
      setSaving(false)
    }
  }

  if (saving) return <Loading>Mažeme účastníka</Loading>

  return (
    <Actions>
      <Button secondary onClick={onCancel}>
        Ne
      </Button>
      <Button danger onClick={handleClickConfirm}>
        Ano, smazat
      </Button>
    </Actions>
  )
}
