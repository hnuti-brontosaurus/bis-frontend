import { skipToken } from '@reduxjs/toolkit/dist/query'
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
  event: { id: number; name: string; location: string }
  onlyApplications?: boolean
}> = ({ event, onlyApplications }) => {
  const [highlightedApplication, setHighlightedApplication] =
    useState<string[]>()
  const [highlightedParticipant, setHighlightedParticipant] = useState<string>()

  const { data: applicationsData } =
    api.endpoints.readEventApplications.useQuery(
      event
        ? {
            eventId: event.id,
            pageSize: 10000,
          }
        : skipToken,
    )

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
      // @ts-ignore
        event={{ ...event, location: event.location?.name }}
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
          eventId={event.id}
          highlightedParticipant={highlightedParticipant}
          chooseHighlightedParticipant={id => {
            if (id && participantsMap)
              setHighlightedApplication(participantsMap[id])
            else {
              setHighlightedApplication(undefined)
            }
          }}
          eventName={event.name}
          participantsMap={participantsMap}
        />
      )}
    </div>
  )
}
