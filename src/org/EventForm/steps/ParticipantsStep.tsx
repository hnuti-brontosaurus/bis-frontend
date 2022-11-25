import { FC } from 'react'
import styles from './ParticipantsStep.module.scss'
import Applications from './registration/Applications'
import Participants from './registration/Participants'

const ParticipantsStep: FC<{
  eventId: number
  onlyApplications?: boolean
}> = ({ eventId, onlyApplications }) => {
  return (
    <div className={styles.participantsContainer}>
      <Applications eventId={eventId} />
      {!onlyApplications && <Participants eventId={eventId} />}
    </div>
  )
}

export default ParticipantsStep
