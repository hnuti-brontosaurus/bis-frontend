import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import { EventApplication } from 'app/services/bisTypes'
import classnames from 'classnames'
import {
  Button,
  EmptyListPlaceholder,
  Loading,
  TableCellIconButton,
} from 'components'
import { useRejectApplication } from 'hooks/rejectApplication'
import { FC, useState } from 'react'
import {
  FaTrash as Bin,
  FaTrashRestoreAlt,
  FaUserPlus as AddUser,
} from 'react-icons/fa'
import colors from 'styles/colors.module.scss'
import styles from '../ParticipantsStep.module.scss'
import { AddParticipantModal } from './AddParticipantModal'
import { NewApplicationModal } from './NewApplicationModal'
import { ShowApplicationModal } from './ShowApplicationModal'

export const Applications: FC<{
  eventId: number
  eventName: string
  chooseHighlightedApplication: (id: string | undefined) => void
  highlightedApplications?: string[]
  withParticipants?: boolean
}> = ({
  eventId,
  eventName,
  highlightedApplications,
  chooseHighlightedApplication,
  withParticipants,
}) => {
  const [showNewApplicationModal, setShowNewApplicationModal] =
    useState<boolean>(false)
  const [showAddParticipantModal, setShowAddParticipantModal] =
    useState<boolean>(false)
  const [showShowApplicationModal, setShowShowApplicationModal] =
    useState<boolean>(false)
  const [highLightedRow, setHighlightedRow] = useState<number>()
  const [currentApplicationId, setCurrentApplicationId] = useState<number>()

  const [rejectApplication] = useRejectApplication()

  const [updateApplication] = api.endpoints.updateEventApplication.useMutation()

  const restoreApplication = async (
    application: EventApplication,
    event: { id: number; name: string },
  ) => {
    await updateApplication({
      id: application.id,
      eventId: event.id,
      patchedEventApplication: {
        state: 'pending',
      },
    })
  }

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

  const { data: applicationsData, isLoading: isReadApplicationsLoading } =
    api.endpoints.readEventApplications.useQuery({
      eventId,
      pageSize: 10000,
    })

  let applications = applicationsData ? applicationsData.results : []

  const applicationsPending = applications.filter(
    app => app.state === 'pending',
  )

  const applicationsAccepted = applications.filter(
    app => app.state === 'approved',
  )

  const applicationsRejected = applications.filter(
    app => app.state === 'rejected',
  )

  const handleShowApplication = (id: number) => {
    setCurrentApplicationId(id)
    setShowShowApplicationModal(true)
  }

  const thereAreApplications = applications && applications.length !== 0

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
        highlightedApplications?.includes(application.id.toString()) &&
          styles.highlightedRow,
        application.state === ('rejected' as const) &&
          styles.applicationWithParticipant,
        className,
        highLightedRow === application.id ? styles.highlightedRow : '',
        application.state === ('approved' as const) && styles.approvedRow,
      )}
      onMouseEnter={() => {
        setHighlightedRow(application.id)
        chooseHighlightedApplication(application.id.toString())
      }}
      onMouseLeave={() => {
        setHighlightedRow(undefined)
        chooseHighlightedApplication(undefined)
      }}
    >
      <td onClick={() => handleShowApplication(application.id)}>
        {application.first_name}
      </td>
      <td onClick={() => handleShowApplication(application.id)}>
        {application.last_name}
      </td>
      <td onClick={() => handleShowApplication(application.id)}>
        {application.birthday}
      </td>
      {withParticipants && (
        <TableCellIconButton
          icon={AddUser}
          action={() => {
            setCurrentApplicationId(application.id)
            setShowAddParticipantModal(true)
          }}
          disabled={application.state === 'rejected'}
          tooltipContent={'Přidej účastníka'}
          color={colors.bronto}
        />
      )}

      <TableCellIconButton
        icon={
          application.state === ('rejected' as const) ? FaTrashRestoreAlt : Bin
        }
        action={async () => {
          if (application.state === ('rejected' as const)) {
            restoreApplication(application, { id: eventId, name: eventName })
          } else {
            rejectApplication({
              application,
              event: { id: eventId, name: eventName },
            })
          }
        }}
        disabled={application.state === ('approved' as const)}
        tooltipContent={
          application.state === ('rejected' as const)
            ? 'Obnov přihlášku'
            : 'Odmítni přihlášku'
        }
        color={
          application.state === ('rejected' as const)
            ? colors.bronto
            : colors['error']
        }
      />
    </tr>
  )

  return (
    <>
      <div className={styles.ListContainer}>
        <h2>Přihlášení</h2>
        <div className={styles.buttonsContainer}>
          <Button secondary type="button">
            Export do CSV
          </Button>
          <Button secondary type="button">
            Tiskni prezenční listinu
          </Button>
          <Button
            primary
            type="button"
            onClick={() => {
              setShowNewApplicationModal(true)
            }}
          >
            Přidej novou přihlášku
          </Button>
        </div>

        {!isReadApplicationsLoading ? (
          <div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jméno</th>
                  <th>příjmení</th>
                  <th>datum narození</th>
                  {withParticipants && (
                    <th>
                      <AddUser className={classnames(styles.iconHead)} />
                    </th>
                  )}
                  <th>
                    <Bin className={classnames(styles.iconHead)}></Bin>
                  </th>
                </tr>
              </thead>
              <tbody>
                <>
                  {applicationsPending.map((application: EventApplication) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                    />
                  ))}
                  {applicationsAccepted.length > 0 && (
                    <tr>
                      <td colSpan={5} className={styles.oneCellRow}>
                        Přidání do účastníků
                      </td>
                    </tr>
                  )}
                  {applicationsAccepted.map((application: EventApplication) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                    />
                  ))}
                  {applicationsRejected.length > 0 && (
                    <tr>
                      <td colSpan={5} className={styles.oneCellRow}>
                        Odmítnuté přihlášky
                      </td>
                    </tr>
                  )}

                  {applicationsRejected.map((application: EventApplication) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                    />
                  ))}
                </>
              </tbody>
            </table>

            {!thereAreApplications && (
              <EmptyListPlaceholder label="Ještě se nikdo nepřihlásil" />
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
              setHighlightedRow(undefined)
              setShowShowApplicationModal(false)
            }}
            currentApplication={currentApplication}
            eventName={eventName}
            eventId={eventId}
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
