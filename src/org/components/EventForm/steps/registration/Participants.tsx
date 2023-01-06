import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import type { User, UserPayload } from 'app/services/bisTypes'
import classNames from 'classnames'
import { Button, Loading } from 'components'
import { SelectUnknownUser } from 'components/SelectUsers'
import stylesTable from 'components/Table.module.scss'
import { UserForm } from 'components/UserForm/UserForm'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import { useAwaitModal } from 'hooks/useAwaitModal'
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
  const { data: membershipCategories } =
    api.endpoints.readMembershipCategories.useQuery({})

  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })

  const { data: currentParticipant } = api.endpoints.readUser.useQuery(
    currentParticipantId ? { id: currentParticipantId } : skipToken,
  )

  const [patchEvent] = api.endpoints.updateEvent.useMutation()
  const [createUser, createUserStatus] = api.endpoints.createUser.useMutation()

  useShowApiErrorMessage(createUserStatus.error)

  const [inputNewUserData, newUserModal] = useAwaitModal(TestUserForm)

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
        },
      },
    }).unwrap()

    setLastAddedId(newParticipantId)
    setTimeOfLastAddition(Date.now())
  }

  // Add a participant who doesn't yet exist in the database
  const handleAddNewParticipant = async () => {
    // first we open a modal with new user form
    try {
      const inputData = await inputNewUserData({ title: 'Nový účastník' })
      const data = merge({ donor: null, offers: null }, inputData)
      // then we create the user and add them as participant
      const { id: userId } = await createUser(data).unwrap()
      await addParticipant(userId)
    } catch (e) {
      // not sure if we need to do anything here
      // one case is when adding is cancelled
    }
  }

  return (
    <div className={styles.ListContainer}>
      {newUserModal}
      <h2>Účastníci</h2>
      {!isReadParticipantsLoading ? (
        <div>
          <div>Přidat účastníka:</div>
          <SelectUnknownUser
            onChange={async selectedUser => {
              if (selectedUser) {
                await addParticipant(selectedUser.id)
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
          <Button type="button" secondary onClick={handleAddNewParticipant}>
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
                      <EditUser
                        className={styles.editUserIconContainer}
                      ></EditUser>
                    </td>
                    <td
                      onClick={() => {}}
                      className={stylesTable.cellWithButton}
                    >
                      <Bin className={styles.binIconContainer}></Bin>
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

const TestUserForm = ({
  onResolve,
  onReject,
}: {
  onResolve: (user: UserPayload) => void
  onReject: () => void
}) => <UserForm onSubmit={onResolve} onCancel={onReject} />
