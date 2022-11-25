import { FC } from 'react'
import { api } from '../../../app/services/bis'
import Loading from '../../../components/Loading'
import styles from './ParticipantsStep.module.scss'
import Applications from './registration/Applications'
import Participants from './registration/Participants'

const ParticipantsStep: FC<{
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
    <div className={styles.participantsContainer}>
      <Applications eventId={eventId} />
      <Participants eventId={eventId} />
    </div>
  )
}

export default ParticipantsStep
