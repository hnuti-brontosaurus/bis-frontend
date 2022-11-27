import { FC } from 'react'
import { api } from '../../../../app/services/bis'
import { User } from '../../../../app/services/testApi'
import { ReactComponent as Bin } from '../../../../assets/trash-solid.svg'
import { ReactComponent as EditUser } from '../../../../assets/user-pen-solid.svg'
import Loading from '../../../../components/Loading'
import stylesTable from '../../../../components/Table.module.scss'
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
                    <td
                      onClick={() => {}}
                      className={stylesTable.cellWithButton}
                    >
                      <EditUser
                        className={styles.editUserIconContainer}
                      ></EditUser>
                    </td>
                    <td
                      onClick={() => {}}
                      className={stylesTable.cellWithButton}
                    >
                      <Bin className={styles.binIconContainer}></Bin>
                    </td>
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
