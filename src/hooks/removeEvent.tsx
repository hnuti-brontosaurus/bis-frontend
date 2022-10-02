import 'react-confirm-alert/src/react-confirm-alert.css'
import { api } from '../app/services/bis'

import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

// open modal before before removing event

export const useRemoveEvent = () => {
  const [removeEvent, states] = api.endpoints.removeEvent.useMutation()

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
    }
  }
  return [removeEventWithModal, states] as const
}
