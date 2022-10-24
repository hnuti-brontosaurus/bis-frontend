import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Link } from 'react-router-dom'
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
          <h1>Prilezitosti</h1>
          <Link to="/org/prilezitosti/vytvorit">
            <button>Nova prilezitost</button>
          </Link>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <th>Nazev</th>
                <th>Typ</th>
              </tr>
            </thead>
            <tbody>
              {opportunities &&
                opportunities.results.map(opportunity => (
                  <tr key={opportunity.id}>
                    <td>{opportunity.name}</td>
                    <td>{opportunity.category.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Opportunity
