import { useNavigate } from 'react-router-dom'
import { api, OpportunityPayload } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'
import OpportunityForm from './OpportunityForm'

const CreateOpportunity = () => {
  const { data: currentUser } = useCurrentUser()

  const navigate = useNavigate()

  const handleSubmit = async (data: OpportunityPayload) => {
    const { id } = await createOpportunity({
      userId: currentUser!.id,
      opportunity: data,
    }).unwrap()
    navigate(`/org/prilezitosti/${id}`)
  }

  const handleCancel = () => {
    // TODO do whatever we need to do to clear the form, when it's persistent
    // perhaps also ask for a confirmation
    navigate('/org/prilezitosti')
  }

  const [createOpportunity] = api.endpoints.createOpportunity.useMutation()

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Nová příležitost</h1>
      <OpportunityForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}

export default CreateOpportunity
