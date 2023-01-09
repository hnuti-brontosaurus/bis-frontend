import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import type { User, UserPayload } from 'app/services/bisTypes'
import classNames from 'classnames'
import { Actions, Button, Loading, StyledModal } from 'components'
import { SelectUnknownUser } from 'components/SelectUsers'
import stylesTable from 'components/Table.module.scss'
import { UserForm } from 'components/UserForm/UserForm'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import { merge } from 'lodash'
import { FC, useState } from 'react'
import { FaTrash as Bin, FaUserEdit as EditUser } from 'react-icons/fa'
import styles from '../ParticipantsStep.module.scss'
import { ShowApplicationModal } from './ShowApplicationModal'

export const Participants: FC<{
  eventId: number
  eventName: string
  chooseHighlightedParticipant: (id: string | undefined) => void
  highlightedParticipant?: string
  savedParticipants?: { [s: string]: string }
}> = ({
  eventId,
  eventName,
  highlightedParticipant,
  chooseHighlightedParticipant,
  savedParticipants,
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
      <h2>Účastníci</h2>
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
                  <th>Jméno, příjmení, datum narození</th>
                  <th></th>
                  <th></th>
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
                    )}
                    onMouseEnter={() => {
                      chooseHighlightedParticipant(participant.id)
                    }}
                    onMouseLeave={() => {
                      chooseHighlightedParticipant(undefined)
                    }}
                  >
                    <td
                      onClick={() => {
                        setShowShowApplicationModal(true)
                        setCurrentParticipantId(participant.id)
                      }}
                    >
                      {participant.first_name}, {participant.last_name}
                      {participant.nickname && ', '}
                      {participant.nickname}
                      {participant.birthday && ', '}
                      {participant.birthday}
                    </td>
                    <td
                      onClick={() => {}}
                      className={stylesTable.cellWithButton}
                    >
                      <button
                        type="button"
                        aria-label={`Upravit účastníka ${participant.first_name} ${participant.last_name}`}
                        onClick={() => handleClickEditParticipant(participant)}
                      >
                        <EditUser className={styles.editUserIconContainer} />
                      </button>
                    </td>
                    <td
                      onClick={() => {}}
                      className={stylesTable.cellWithButton}
                    >
                      <button
                        type="button"
                        aria-label={`Smazat účastníka ${participant.first_name} ${participant.last_name}`}
                        onClick={() =>
                          handleClickRemoveParticipant(participant)
                        }
                      >
                        <Bin
                          aria-hidden="true"
                          className={styles.binIconContainer}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          }}
          userId={currentParticipantId}
          currentParticipant={currentParticipant}
          eventName={eventName}
          eventId={eventId}
          categories={membershipCategories?.results ?? []}
          administrationUnits={
            administrationUnits ? administrationUnits.results : []
          }
          savedParticipants={savedParticipants}
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
