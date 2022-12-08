import { Loading } from 'components'
import merge from 'lodash/merge'
import { useNavigate, useParams } from 'react-router-dom'
import { Optional } from 'utility-types'
import { api } from '../app/services/bis'
import { useCreateOrSelectLocation } from '../components/SelectLocation'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from '../features/systemMessage/useSystemMessage'
import { useCurrentUser } from '../hooks/currentUser'
import { useTitle } from '../hooks/title'
import OpportunityForm, { OpportunityFormShape } from './OpportunityForm'

const UpdateOpportunity = () => {
  useTitle('Upravit příležitost')
  const params = useParams()
  const opportunityId = Number(params.opportunityId)
  const { data: user } = useCurrentUser()
  const userId = user!.id

  const navigate = useNavigate()

  const showMessage = useShowMessage()

  const {
    data: opportunity,
    error,
    isLoading: isOpportunityLoading,
    isError,
  } = api.endpoints.readOpportunity.useQuery({ id: opportunityId, userId })

  const [updateOpportunity, updateOpportunityStatus] =
    api.endpoints.updateOpportunity.useMutation()

  useShowApiErrorMessage(
    updateOpportunityStatus.error,
    'Nepodařilo se upravit příležitost',
  )

  const createOrSelectLocation = useCreateOrSelectLocation()

  if (updateOpportunityStatus.isLoading) {
    return <Loading>Ukládáme změny</Loading>
  }

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
    showMessage({
      message: 'Příležitost byla úspěšně změněna',
      type: 'success',
    })
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
