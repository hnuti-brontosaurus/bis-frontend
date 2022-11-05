import merge from 'lodash/merge'
import { useNavigate } from 'react-router-dom'
import { api } from '../app/services/bis'
import { useCreateOrSelectLocation } from '../components/SelectLocation'
import { useCurrentUser } from '../hooks/currentUser'
import OpportunityForm, { OpportunityFormShape } from './OpportunityForm'

const CreateOpportunity = () => {
  const { data: currentUser } = useCurrentUser()

  const navigate = useNavigate()

  const [createOpportunity] = api.endpoints.createOpportunity.useMutation()
  const createOrSelectLocation = useCreateOrSelectLocation()

  const handleSubmit = async (data: OpportunityFormShape) => {
    const locationId = await createOrSelectLocation(data.location)

    const { id } = await createOpportunity({
      userId: currentUser!.id,
      opportunity: merge({}, data, { location: locationId }),
    }).unwrap()
    navigate(`/org/prilezitosti/${id}`)
  }

  const handleCancel = () => {
    // TODO do whatever we need to do to clear the form, when it's persistent
    // perhaps also ask for a confirmation
    navigate('/org/prilezitosti')
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Nová příležitost</h1>
      <OpportunityForm
        id="new"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default CreateOpportunity
