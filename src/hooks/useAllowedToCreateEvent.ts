import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import { hasRequiredQualification } from 'org/utils/validateQualifications'
import { useCurrentUser } from './currentUser'

export const useAllowedToCreateEvent = () => {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const { data: allQualifications, isLoading } =
    api.endpoints.readQualifications.useQuery(currentUser ? {} : skipToken)

  const canAddNewEvent =
    currentUser &&
    allQualifications &&
    hasRequiredQualification(
      currentUser,
      allQualifications.results.map(q => q.slug),
      allQualifications.results,
    )
  return [canAddNewEvent, isLoading || isLoadingUser]
}
