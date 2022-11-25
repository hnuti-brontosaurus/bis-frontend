import { FC } from 'react'
import { api } from '../../../../app/services/bis'
import { User } from '../../../../app/services/testApi'
import Loading from '../../../../components/Loading'
import styles from '../ParticipantsStep.module.scss'

const Participants: FC<{
  eventId: number
}> = ({ eventId }) => {
  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery({ eventId })

  return (
    <div className={styles.ListContainer}>
      <h2>Ucastnici</h2>
      {!isReadParticipantsLoading ? (
        <div>
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
                  <tr>
                    <td>
                      {participant.first_name}, {participant.last_name}
                      {participant.nickname && ', '}
                      {participant.nickname}
                      {participant.birthday && ', '}
                      {participant.birthday}
                    </td>
                    <td onClick={() => {}}>edit</td>
                    <td onClick={() => {}}>X</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <Loading>Stahujeme ucastniky</Loading>
      )}
    </div>
  )
}

export default Participants
