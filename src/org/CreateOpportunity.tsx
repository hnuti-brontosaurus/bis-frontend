import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'

const Opportunity = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()
  const { data: opportunities, isLoading } =
    api.endpoints.readOpportunities.useQuery(
      currentUser
        ? {
            userId: currentUser.id,
            page: 1,
            pageSize: 10000,
          }
        : skipToken,
    )
  return (
    <div>
      <div>
        <div>
          <h1>Nova prilezitost</h1>
        </div>
      </div>
    </div>
  )
}

export default Opportunity
