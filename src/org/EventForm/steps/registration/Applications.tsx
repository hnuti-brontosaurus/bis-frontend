import { skipToken } from '@reduxjs/toolkit/dist/query'
import classnames from 'classnames'
import { FC, useState } from 'react'
import { api } from '../../../../app/services/bis'
import { EventApplication } from '../../../../app/services/bisTypes'
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
  chooseHighlightedApplication: (id: string | undefined) => void
  highlightedApplication?: string
}> = ({
  eventId,
  eventName,
  highlightedApplication,
  chooseHighlightedApplication,
}) => {
  const [showNewApplicationModal, setShowNewApplicationModal] =
    useState<boolean>(false)
  const [showAddParticipantModal, setShowAddParticipantModal] =
    useState<boolean>(false)
  const [showShowApplicationModal, setShowShowApplicationModal] =
    useState<boolean>(false)
  const [currentApplicationId, setCurrentApplicationId] = useState<number>()

  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: programs } = api.endpoints.getPrograms.useQuery()
  const { data: administrationUnits } =
    api.endpoints.getAdministrationUnits.useQuery({ pageSize: 2000 })

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

  const { data: applicationsData, isLoading: isReadApplicationsLoading } =
    api.endpoints.readEventApplications.useQuery({
      eventId,
      pageSize: 10000,
    })

  let applications = applicationsData
    ? applicationsData.results.filter(
        app => app.first_name !== 'InternalApplication',
      )
    : []
  const savedApplications =
    applicationsData &&
    applicationsData.results
      .filter(app => app.first_name === 'InternalApplication')
      .reduce((savedApps, app) => {
        // @ts-ignore
        if (app.nickname) savedApps[app.nickname] = app.last_name
        return savedApps
      }, {})

  const applicationsFirst = applications.filter(
    // @ts-ignore
    app => !(savedApplications && savedApplications[app.id]),
  )

  const applicationsSecond = applications.filter(
    // @ts-ignore
    app => savedApplications && savedApplications[app.id],
  )

  applications = applicationsFirst.concat(applicationsSecond)

  const handleShowApplication = (id: number) => {
    setCurrentApplicationId(id)
    setShowShowApplicationModal(true)
  }

  const thereAreApplications =
    applications && applications && applications.length !== 0

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
                  {applications.map((application: EventApplication) => (
                    <tr
                      className={classnames(
                        highlightedApplication === application.id.toString()
                          ? styles.highlightedRow
                          : '',
                        application.id &&
                          savedApplications &&
                          // @ts-ignore
                          savedApplications[application.id.toString()]
                          ? styles.applicationWithParticipant
                          : '',
                      )}
                      onMouseEnter={() => {
                        chooseHighlightedApplication(application.id.toString())
                      }}
                      onMouseLeave={() => {
                        chooseHighlightedApplication(undefined)
                      }}
                    >
                      <td
                        onClick={() => handleShowApplication(application.id)}
                        colSpan={
                          savedApplications &&
                          // @ts-ignore
                          savedApplications[application.id.toString()]
                            ? 1
                            : 2
                        }
                      >
                        {application.first_name}, {application.last_name}
                        {application.birthday && ', '}
                        {application.birthday}
                      </td>
                      {savedApplications &&
                        // @ts-ignore
                        savedApplications[application.id.toString()] && (
                          <td className={styles.applicationAddedTag}>
                            'pridano!'
                          </td>
                        )}
                      <td
                        onClick={() => {
                          setCurrentApplicationId(application.id)
                          setShowAddParticipantModal(true)
                        }}
                        className={classnames(
                          stylesTable.cellWithButton,
                          savedApplications &&
                            // @ts-ignore
                            savedApplications[application.id.toString()] &&
                            styles.disabledIconContainer,
                        )}
                      >
                        <AddUser
                          className={classnames(styles.addUserIconContainer)}
                        />
                      </td>
                      <td
                        onClick={() => {
                          deleteEventApplication({
                            applicationId: application.id,
                            eventId,
                          })
                        }}
                        className={classnames(
                          stylesTable.cellWithButton,
                          savedApplications &&
                            // @ts-ignore
                            savedApplications[application.id.toString()] &&
                            styles.disabledIconContainer,
                        )}
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
              setCurrentApplicationId(undefined)

              setShowShowApplicationModal(false)
            }}
            userId={
              // @ts-ignore
              savedApplications && savedApplications[currentApplication.id]
            }
            currentApplication={currentApplication}
            eventName={eventName}
            eventId={eventId}
            setCurrentApplicationId={setCurrentApplicationId}
            setShowAddParticipantModal={setShowAddParticipantModal}
            deleteEventApplication={deleteEventApplication}
            categories={categories ? categories.results : []}
            programs={programs ? programs.results: []}
            administrationUnits={administrationUnits                ? administrationUnits.results: []}
          ></ShowApplicationModal>
        )}
      </div>
    </>
  )
}

export default Applications
