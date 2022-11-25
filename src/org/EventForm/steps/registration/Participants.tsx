import { FC } from 'react'
import { api } from '../../../../app/services/bis'
import { User } from '../../../../app/services/testApi'
import Loading from '../../../../components/Loading'
import styles from '../ParticipantsStep.module.scss'

const Participants: FC<{
  eventId: number
}> = ({ eventId }) => {
  // we're loading these to make sure that we have the data before we try to render the form, to make sure that the default values are properly initialized
  // TODO check whether this is necessary
  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: groups } = api.endpoints.getEventGroups.useQuery()
  const { data: programs } = api.endpoints.getPrograms.useQuery()
  const { data: intendedFor } = api.endpoints.getIntendedFor.useQuery()
  const { data: diets } = api.endpoints.getDiets.useQuery()
  const { data: administrationUnits } =
    api.endpoints.getAdministrationUnits.useQuery({ pageSize: 2000 })
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const { data: participants, isLoading: isReadParticipantsLoading } =
    api.endpoints.readEventParticipants.useQuery({ eventId })

  if (
    !(
      groups &&
      diets &&
      programs &&
      categories &&
      intendedFor &&
      allQualifications &&
      administrationUnits
    )
  )
    return <Loading>Připravujeme formulář</Loading>

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
