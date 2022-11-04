import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import Loading from '../components/Loading'
import { useCurrentUser } from '../hooks/currentUser'
import { useRemoveOpportunity } from '../hooks/removeOpportunity'

const ViewOpportunity = () => {
  const params = useParams()
  const opportunityId = Number(params.opportunityId)
  const { data: user } = useCurrentUser()
  const userId = user!.id

  const navigate = useNavigate()

  const {
    data: opportunity,
    isLoading: isOpportunityLoading,
    isError,
  } = api.endpoints.readOpportunity.useQuery({ id: opportunityId, userId })

  const [removeOpportunity, { isLoading: isOpportunityRemoving }] =
    useRemoveOpportunity()

  if (isError) return <>Nepodařilo se nám najít příležitost</>

  if (isOpportunityLoading || !opportunity)
    return <Loading>Stahujeme příležitost</Loading>

  if (isOpportunityRemoving) return <Loading>Mažeme příležitost</Loading>

  const handleClickRemove = async () => {
    await removeOpportunity({ ...opportunity, userId })
    navigate('..')
  }

  return (
    <div>
      <header>There are just data of opportunity here...</header>
      <nav>
        <Link to={`/org/prilezitosti/${opportunityId}/upravit`}>upravit</Link>
        <button onClick={handleClickRemove}>smazat</button>
      </nav>
      <pre>{JSON.stringify(opportunity, null, '  ')}</pre>
    </div>
  )
}

export default ViewOpportunity
