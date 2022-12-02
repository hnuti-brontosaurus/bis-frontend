import { skipToken } from '@reduxjs/toolkit/dist/query'
import { FC, useState } from 'react'
import { api } from '../../../../app/services/bis'
import { EventApplication } from '../../../../app/services/bisTypes'
import AddParticipantModal from '../../../../components/AddParticipantModal'
import Loading from '../../../../components/Loading'
import NewApplicationModal from '../../../../components/NewApplicationModal'
import styles from '../ParticipantsStep.module.scss'

const ParticipantsStep: FC<{
  eventId: number
}> = ({ eventId }) => {
  const [showNewApplicationModal, setShowNewApplicationModal] =
    useState<boolean>(false)
  const [showAddParticipantModal, setShowAddParticipantModal] =
    useState<boolean>(false)
  const [currentApplicationId, setCurrentApplicationId] = useState<number>()

  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery({ eventId })

  const { data: currentApplication } =
    api.endpoints.readEventApplication.useQuery(
      eventId && currentApplicationId
        ? {
            eventId,
            applicationId: currentApplicationId,
          }
        : skipToken,
    )

  const [deleteEventApplication] =
    api.endpoints.deleteEventApplication.useMutation()

  const { data: applications, isLoading: isReadApplicationsLoading } =
    api.endpoints.readEventApplications.useQuery({
      eventId,
      pageSize: 10000,
    })

  return (
    <>
      <div className={styles.ListContainer}>
        <h2>Prihlaseni</h2>
        <div className={styles.buttonsContainer}>
          <button type="button">Export do csv (WIP)</button>
          <button type="button">Tisknij prezencni listinu (WIP)</button>
        </div>
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <button
              type="button"
              onClick={() => {
                setShowNewApplicationModal(true)
              }}
            >
              Pridaj novou prihlasku
            </button>
          </div>
        </div>
        {!isReadApplicationsLoading ? (
          <div>
            {applications &&
            applications.results &&
            applications.results.length !== 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Jmeno, prijmeni, datum narozeni</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {applications.results.map((application: EventApplication) => (
                    <tr>
                      <td>
                        {application.first_name}, {application.last_name}
                        {application.birthday && ', '}
                        {application.birthday}
                      </td>
                      <td
                        onClick={() => {
                          deleteEventApplication({
                            applicationId: application.id,
                            eventId,
                          })
                        }}
                        className={styles.cellWithButton}
                      >
                        X
                      </td>
                      <td
                        onClick={() => {
                          setCurrentApplicationId(application.id)
                          setShowAddParticipantModal(true)
                        }}
                        className={styles.cellWithButton}
                      >
                        {'->'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <>Pusty seznam</>
            )}
          </div>
        ) : (
          <Loading>Stahujeme prihlaski</Loading>
        )}
        <NewApplicationModal
          open={showNewApplicationModal}
          onClose={() => {
            setShowNewApplicationModal(false)
          }}
          eventId={eventId}
        ></NewApplicationModal>

        {currentApplication && (
          <AddParticipantModal
            open={showAddParticipantModal}
            onClose={() => {
              setShowAddParticipantModal(false)
            }}
            currentApplication={currentApplication}
            defaultUserData={currentApplication}
            eventId={eventId}
            eventParticipants={
              participants ? participants?.results.map(({ id }) => id) : []
            }
          />
        )}
      </div>
    </>
  )
}

export default ParticipantsStep
