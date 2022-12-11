import { FC, useState } from 'react'
import { api } from '../../../app/services/bis'
import styles from './ParticipantsStep.module.scss'
import { Applications } from './registration/Applications'
import { Participants } from './registration/Participants'

export const ParticipantsStep: FC<{
  eventId: number
  onlyApplications?: boolean
  eventName: string
}> = ({ eventId, onlyApplications, eventName }) => {
  const [highlightedApplication, setHighlightedApplication] = useState<string>()
  const [highlightedParticipant, setHighlightedParticipant] = useState<string>()

  const { data: applicationsData, isLoading: isReadApplicationsLoading } =
    api.endpoints.readEventApplications.useQuery({
      eventId,
      pageSize: 10000,
    })
  const savedApplications: { [s: string]: string } | undefined =
    applicationsData &&
    applicationsData.results
      .filter(app => app.first_name === 'InternalApplication')
      .reduce((savedApps, app) => {
        // @ts-ignore
        if (app.nickname) savedApps[app.nickname] = app.last_name.toString()
        return savedApps
      }, {})
  const savedParticipants: { [s: string]: string } | undefined = {}
  if (savedApplications)
    for (const [key, value] of Object.entries(savedApplications)) {
      savedParticipants[value] = key
    }

  return (
    <div className={styles.participantsContainer}>
      <Applications
        eventId={eventId}
        eventName={eventName}
        highlightedApplication={highlightedApplication}
        chooseHighlightedApplication={id =>
          setHighlightedParticipant(
            savedApplications && id && savedApplications[id],
          )
        }
      />
      {!onlyApplications && (
        <Participants
          eventId={eventId}
          highlightedParticipant={highlightedParticipant}
          chooseHighlightedParticipant={id => {
            setHighlightedApplication(
              savedParticipants && id && savedParticipants[id],
            )
          }}
          eventName={eventName}
          savedParticipants={savedParticipants}
        />
      )}
    </div>
  )
}
