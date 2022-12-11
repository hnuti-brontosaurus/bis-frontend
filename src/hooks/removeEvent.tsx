import { api } from 'app/services/bis'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

// open modal before before removing event

export const useRemoveEvent = () => {
  const [removeEvent, states] = api.endpoints.removeEvent.useMutation()

  useShowApiErrorMessage(states.error, 'Nepodařilo se smazat akci')
  const showMessage = useShowMessage()

  const removeEventWithModal = async (event: { id: number; name: string }) => {
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
        title: `Mažeš akci ${event.name}`,
        message: 'Všechna data budou navždy ztracena. Chceš pokračovat?',
      })
    })
    if (isConfirmed) {
      await removeEvent(event).unwrap()
      showMessage({
        message: 'Akce byla úspěšně smazána',
        type: 'success',
      })
    }
  }
  return [removeEventWithModal, states] as const
}
