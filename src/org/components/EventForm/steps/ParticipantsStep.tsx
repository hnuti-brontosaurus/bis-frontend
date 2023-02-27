import { api } from 'app/services/bis'
import { FC, useState } from 'react'
import styles from './ParticipantsStep.module.scss'
import { Applications } from './registration/Applications'
import { Participants } from './registration/Participants'

export enum ApplicationStates {
  approved = 'approved',
  pending = 'pending',
  rejected = 'rejected',
}

export const ParticipantsStep: FC<{
  eventId: number
  onlyApplications?: boolean
  eventName: string
}> = ({ eventId, onlyApplications, eventName }) => {
  const [highlightedApplication, setHighlightedApplication] =
    useState<string[]>()
  const [highlightedParticipant, setHighlightedParticipant] = useState<string>()

  const { data: applicationsData } =
    api.endpoints.readEventApplications.useQuery({
      eventId,
      pageSize: 10000,
    })

  /** creates a new object, where the keys are the application IDs
   * and the values are the corresponding user IDs for each approved
   * application */
  const approvedApplicationsMap: { [s: string]: string } | undefined =
    applicationsData &&
    applicationsData.results
      .filter(app => app.state === ApplicationStates.approved)
      .reduce<{ [appId: string]: string }>((appsMap, app) => {
        if (app.user) appsMap[app.id.toString()] = app.user
        return appsMap
      }, {})

  /** iterates over the created object from the first part and groups
   * together the application IDs by their corresponding user IDs */
  const participantsMap: { [userId: string]: string[] } | undefined = {}
  if (approvedApplicationsMap)
    for (const [appId, userId] of Object.entries(approvedApplicationsMap)) {
      // If the user ID is not already in the participants map, add it with the current application ID as the first item in the array.
      if (userId) {
        if (!participantsMap[userId]) {
          participantsMap[userId] = [appId]
          // If the user ID is already in the participants map, add the current application ID to the array.
        } else {
          participantsMap[userId].push(appId)
        }
      }
    }

  return (
    <div className={styles.participantsContainer}>
      <Applications
        eventId={eventId}
        eventName={eventName}
        highlightedApplications={highlightedApplication}
        chooseHighlightedApplication={id =>
          setHighlightedParticipant(
            approvedApplicationsMap && id && approvedApplicationsMap[id],
          )
        }
        withParticipants={!onlyApplications}
        className={styles.centeredTableBlock}
      />
      {!onlyApplications && (
        <Participants
          eventId={eventId}
          highlightedParticipant={highlightedParticipant}
          chooseHighlightedParticipant={id => {
            if (id && participantsMap)
              setHighlightedApplication(participantsMap[id])
            else {
              setHighlightedApplication(undefined)
            }
          }}
          eventName={eventName}
          participantsMap={participantsMap}
        />
      )}
    </div>
  )
}
