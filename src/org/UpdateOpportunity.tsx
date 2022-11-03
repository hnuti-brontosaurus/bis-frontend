import merge from 'lodash/merge'
import { useNavigate, useParams } from 'react-router-dom'
import { Optional } from 'utility-types'
import { api, OpportunityPayload } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'
import OpportunityForm from './OpportunityForm'

const UpdateOpportunity = () => {
  const params = useParams()
  const opportunityId = Number(params.opportunityId)
  const { data: user } = useCurrentUser()
  const userId = user!.id

  const navigate = useNavigate()

  const {
    data: opportunity,
    error,
    isLoading: isOpportunityLoading,
    isError,
  } = api.endpoints.readOpportunity.useQuery({ id: opportunityId, userId })

  const [updateOpportunity] = api.endpoints.updateOpportunity.useMutation()
  // TODO make a proper location
  // const [createLocation] = api.endpoints.createLocation.useMutation()

  if (isError)
    return (
      <>Opportunity not found (or different error) {JSON.stringify(error)}</>
    )

  if (isOpportunityLoading || !opportunity) return <>Loading Opportunity</>

  const initialData = merge({}, opportunity, {
    category: opportunity.category.id,
    image: opportunity.image.original,
  })

  const handleSubmit = async (data: Optional<OpportunityPayload, 'image'>) => {
    // TODO location

    // if image hasn't changed, delete it
    if (initialData.image === data.image) delete data.image

    // update opportunity
    await updateOpportunity({
      id: opportunityId,
      userId,
      patchedOpportunity: data,
    }).unwrap()

    navigate(`/org/prilezitosti/${opportunityId}`)
  }

  const handleCancel = () => {
    // TODO when form is persistent, remove from persistent storage
    // also ask for confirmation
    navigate('/org/prilezitosti')
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Upravit příležitost</h1>
      <OpportunityForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isUpdate
      />
    </div>
  )
}

export default UpdateOpportunity
