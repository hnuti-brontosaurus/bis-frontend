import merge from 'lodash/merge'
import { useNavigate, useParams } from 'react-router-dom'
import { Optional } from 'utility-types'
import { api } from '../app/services/bis'
import Loading from '../components/Loading'
import { useCreateOrSelectLocation } from '../components/SelectLocation'
import { useCurrentUser } from '../hooks/currentUser'
import OpportunityForm, { OpportunityFormShape } from './OpportunityForm'

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

  const createOrSelectLocation = useCreateOrSelectLocation()

  if (isError)
    return (
      <>Opportunity not found (or different error) {JSON.stringify(error)}</>
    )

  if (isOpportunityLoading || !opportunity)
    return <Loading>Stahujeme příležitost</Loading>

  const initialData = merge({}, opportunity, {
    category: opportunity.category.id,
    image: opportunity.image.original,
    location: { id: opportunity.location },
  })

  const handleSubmit = async (
    data: Optional<OpportunityFormShape, 'image'>,
  ) => {
    const locationId = await createOrSelectLocation(data.location)

    // if image hasn't changed, delete it
    if (initialData.image === data.image) delete data.image

    // update opportunity
    await updateOpportunity({
      id: opportunityId,
      userId,
      patchedOpportunity: merge(data, { location: locationId }),
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
        id={String(userId + '-' + opportunityId)}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isUpdate
      />
    </div>
  )
}

export default UpdateOpportunity
