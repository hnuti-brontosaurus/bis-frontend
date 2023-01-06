import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import { EventApplication } from 'app/services/bisTypes'
import classnames from 'classnames'
import { Loading } from 'components'
import stylesTable from 'components/Table.module.scss'
import { useRejectApplication } from 'hooks/rejectApplication'
import { FC, useState } from 'react'
import { FaTrash as Bin, FaUserPlus as AddUser } from 'react-icons/fa'
import styles from '../ParticipantsStep.module.scss'
import { AddParticipantModal } from './AddParticipantModal'
import { NewApplicationModal } from './NewApplicationModal'
import { ShowApplicationModal } from './ShowApplicationModal'

export const Applications: FC<{
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

  const [rejectApplication] = useRejectApplication()

  const { data: membershipCategories } =
    api.endpoints.readMembershipCategories.useQuery({})
  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })

  const { data: participants } = api.endpoints.readEventParticipants.useQuery({
    eventId,
  })

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

  const ApplicationRow = ({
    application,
    className,
  }: {
    application: EventApplication
    className?: string
  }) => (
    <tr
      key={application.id}
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
        className,
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
          <td className={styles.applicationAddedTag}>'pridano!'</td>
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
        <AddUser className={classnames(styles.addUserIconContainer)} />
      </td>
      <td
        onClick={async () => {
          rejectApplication({
            application,
            event: { id: eventId, name: eventName },
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
        <Bin className={styles.binIconContainer}></Bin>
      </td>
    </tr>
  )

  return (
    <>
      <div className={styles.ListContainer}>
        <h2>Přihlášení</h2>
        <div className={styles.buttonsContainer}>
          <button
            type="button"
            className={
              !thereAreApplications ? styles.disabledButton : undefined
            }
          >
            Export do CSV (WIP)
          </button>
          <button
            type="button"
            className={
              !thereAreApplications ? styles.disabledButton : undefined
            }
          >
            Tiskni prezenční listinu (WIP)
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
              Přidej novou přihlášku
            </button>
          </div>
        </div>
        {!isReadApplicationsLoading ? (
          <div>
            {thereAreApplications ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Jméno, příjmení, datum narození</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {applications
                    .filter(a => ['pending', 'approved'].includes(a.state))
                    .map((application: EventApplication) => (
                      <ApplicationRow
                        key={application.id}
                        application={application}
                      />
                    ))}
                  {applications
                    .filter(a => ['rejected'].includes(a.state))
                    .map((application: EventApplication) => (
                      <ApplicationRow
                        key={application.id}
                        application={application}
                        className={styles.rejectedRow}
                      />
                    ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyListBox}>
                <img
                  src="https://i.ibb.co/m0GQt2K/kroliczek.png"
                  alt=""
                  width="200"
                ></img>
                <div>Ještě se nikdo nepřihlásil</div>
              </div>
            )}
          </div>
        ) : (
          <Loading>Stahujeme přihlášky</Loading>
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
            categories={membershipCategories?.results ?? []}
            administrationUnits={
              administrationUnits ? administrationUnits.results : []
            }
          ></ShowApplicationModal>
        )}
      </div>
    </>
  )
}
