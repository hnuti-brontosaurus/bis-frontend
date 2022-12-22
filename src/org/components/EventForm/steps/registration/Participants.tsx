import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import { User } from 'app/services/testApi'
import { Loading } from 'components'
import { SelectUnknownUser } from 'components/SelectUsers'
import stylesTable from 'components/Table.module.scss'
import { useShowMessage } from 'features/systemMessage/useSystemMessage'
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
  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery({ eventId })

  const [showShowApplicationModal, setShowShowApplicationModal] =
    useState<boolean>(false)

  const showMessage = useShowMessage()

  const [currentParticipantId, setCurrentParticipantId] = useState<string>()
  const { data: categories } = api.endpoints.readEventCategories.useQuery()
  const { data: programs } = api.endpoints.readPrograms.useQuery()

  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })

  const { data: currentParticipant } = api.endpoints.readUser.useQuery(
    currentParticipantId ? { id: currentParticipantId } : skipToken,
  )

  const [patchEvent] = api.endpoints.updateEvent.useMutation()

  const addParticipant = async (newParticipantId: string) => {
    let newParticipants: string[] = []

    if (participants) {
      newParticipants = [...participants.results].map(p => p.id)
    }
    newParticipants.push(newParticipantId)

    await patchEvent({
      id: eventId,
      event: {
        record: {
          participants: newParticipants,
        },
      },
    })
  }
  return (
    <div className={styles.ListContainer}>
      <h2>Ucastnici</h2>
      {!isReadParticipantsLoading ? (
        <div>
          <div>Add new participant:</div>
          <SelectUnknownUser
            onChange={selectedUser => {
              if (selectedUser) addParticipant(selectedUser.id)
            }}
            onBirthdayError={message => {
              showMessage({
                type: 'error',
                message: 'Nepodařilo se přidat uživatele',
                detail: message,
              })
            }}
          />
          {participants && participants.results && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jmeno, prijmeni, datum narozeni</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {participants.results.map((participant: User) => (
                  <tr
                    key={participant.id}
                    className={
                      highlightedParticipant === participant.id
                        ? styles.highlightedRow
                        : ''
                    }
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
        <Loading>Stahujeme ucastniky</Loading>
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
          categories={categories ? categories.results : []}
          programs={programs ? programs.results : []}
          administrationUnits={
            administrationUnits ? administrationUnits.results : []
          }
          savedParticipants={savedParticipants}
        ></ShowApplicationModal>
      )}
    </div>
  )
}
