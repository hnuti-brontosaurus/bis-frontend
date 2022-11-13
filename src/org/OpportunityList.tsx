import { FaPlus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { api } from '../app/services/bis'
import ListHeader from '../components/ListHeader'
import Loading from '../components/Loading'
import { UnscalablePaginatedList } from '../components/PaginatedList'
import { useCurrentUser } from '../hooks/currentUser'
import { useTitle } from '../hooks/title'
import OpportunityTable from './OpportunityList/OpportunityTable'

const OpportunityList = () => {
  useTitle('Příležitosti')
  const { data: currentUser } = useCurrentUser()
  // it's safe to assume that the user is already loaded
  const userId = currentUser!.id
  const { data: opportunities } = api.endpoints.readOpportunities.useQuery({
    userId,
    page: 1,
    pageSize: 10000,
  })

  if (!opportunities) {
    return <Loading>Stahujeme příležitosti</Loading>
  }

  return (
    <div>
      <ListHeader
        header="Příležitosti"
        theme="opportunities"
        tabs={[]}
        actions={[
          <Link key="new" to="/org/prilezitosti/vytvorit">
            <FaPlus />
            Nová příležitost
          </Link>,
        ]}
      />
      <UnscalablePaginatedList
        data={opportunities.results}
        table={OpportunityTable}
      />
    </div>
  )
}

export default OpportunityList
