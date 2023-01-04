import { api } from 'app/services/bis'
import { hasRequiredQualification } from 'org/utils/validateQualifications'
import { useCurrentUser } from './currentUser'

export const useAllowedToCreateEvent = () => {
  const { data: currentUser } = useCurrentUser()
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const canAddNewEvent =
    currentUser &&
    allQualifications &&
    hasRequiredQualification(
      currentUser,
      allQualifications.results.map(q => q.slug),
      allQualifications.results,
    )
  return [canAddNewEvent]
}
