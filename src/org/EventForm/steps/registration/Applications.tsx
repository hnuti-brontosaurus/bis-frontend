import { skipToken } from '@reduxjs/toolkit/dist/query'
import { FC, useState } from 'react'
import { api } from '../../../../app/services/bis'
import { EventApplication } from '../../../../app/services/testApi'
import { ReactComponent as Bin } from '../../../../assets/trash-solid.svg'
import { ReactComponent as AddUser } from '../../../../assets/user-plus-solid.svg'
import AddParticipantModal from '../../../../components/AddParticipantModal'
import Loading from '../../../../components/Loading'
import NewApplicationModal from '../../../../components/NewApplicationModal'
import ShowApplicationModal from '../../../../components/ShowApplicationModal'
import stylesTable from '../../../../components/Table.module.scss'
import styles from '../ParticipantsStep.module.scss'

const Applications: FC<{
  eventId: number
  eventName: string
}> = ({ eventId, eventName }) => {
  const [showNewApplicationModal, setShowNewApplicationModal] =
    useState<boolean>(false)
  const [showAddParticipantModal, setShowAddParticipantModal] =
    useState<boolean>(false)
  const [showShowApplicationModal, setShowShowApplicationModal] =
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

  const handleShowApplication = (id: number) => {
    setCurrentApplicationId(id)
    setShowShowApplicationModal(true)
  }

  const thereAreApplications =
    applications && applications.results && applications.results.length !== 0

  console.log('emptyyy?', thereAreApplications)
  return (
    <>
      <div className={styles.ListContainer}>
        <h2>Prihlaseni</h2>
        <div className={styles.buttonsContainer}>
          <button
            type="button"
            className={
              !thereAreApplications ? styles.disabledButton : undefined
            }
          >
            Export do csv (WIP)
          </button>
          <button
            type="button"
            className={
              !thereAreApplications ? styles.disabledButton : undefined
            }
          >
            Tisknij prezencni listinu (WIP)
          </button>
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
            {thereAreApplications ? (
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
                      <td onClick={() => handleShowApplication(application.id)}>
                        {application.first_name}, {application.last_name}
                        {application.birthday && ', '}
                        {application.birthday}
                      </td>
                      <td
                        onClick={() => {
                          setCurrentApplicationId(application.id)
                          setShowAddParticipantModal(true)
                        }}
                        className={stylesTable.cellWithButton}
                      >
                        <AddUser className={styles.addUserIconContainer} />
                      </td>
                      <td
                        onClick={() => {
                          deleteEventApplication({
                            applicationId: application.id,
                            eventId,
                          })
                        }}
                        className={stylesTable.cellWithButton}
                      >
                        {/* <div className={styles.binIconContainer}> */}
                        <Bin className={styles.binIconContainer}></Bin>
                        {/* </div> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyListBox}>
                <img
                  src="https://i.ibb.co/m0GQt2K/kroliczek.png"
                  width="200"
                ></img>
                <div>Jesce se nikdo neprihlasil</div>
              </div>
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
        {currentApplication && (
          <ShowApplicationModal
            open={showShowApplicationModal}
            onClose={() => {
              setShowShowApplicationModal(false)
            }}
            currentApplication={currentApplication}
            eventName={eventName}
            eventId={eventId}
            setCurrentApplicationId={setCurrentApplicationId}
            setShowAddParticipantModal={setShowAddParticipantModal}
            deleteEventApplication={deleteEventApplication}
          ></ShowApplicationModal>
        )}
      </div>
    </>
  )
}

export default Applications
