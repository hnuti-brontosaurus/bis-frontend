import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import { api } from '../app/services/bis'

// open modal before before removing opportunity

export const useRemoveOpportunity = () => {
  const [removeOpportunity, states] =
    api.endpoints.deleteOpportunity.useMutation()

  const removeOpportunityWithModal = async (opportunity: {
    id: number
    userId: number
    name: string
  }) => {
    // replace with custom ui
    const isConfirmed = await new Promise((resolve, reject) => {
      confirmAlert({
        customUI: ({ title, message, onClose }) => (
          <div>
            <header>{title}</header>
            <div>{message}</div>
            <nav>
              <button
                onClick={() => {
                  resolve(false)
                  onClose()
                }}
              >
                Zruš
              </button>
              <button
                onClick={() => {
                  resolve(true)
                  onClose()
                }}
              >
                Pokračuj
              </button>
            </nav>
          </div>
        ),
        title: `Mažeš příležitost ${opportunity.name}`,
        message: 'Všechna data budou navždy ztracena. Chceš pokračovat?',
      })
    })
    if (isConfirmed) {
      await removeOpportunity(opportunity).unwrap()
    }
  }
  return [removeOpportunityWithModal, states] as const
}
