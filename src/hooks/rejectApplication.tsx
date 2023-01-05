import { api } from 'app/services/bis'
import { Actions, Button } from 'components'
import modalStyles from 'components/StyledModal/StyledModal.module.scss'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

// open modal before before removing event

export const useRejectApplication = () => {
  //const [removeEvent, states] = api.endpoints.deleteEvent.useMutation()
  const [updateApplication, states] =
    api.endpoints.updateEventApplication.useMutation()

  useShowApiErrorMessage(states.error, 'Nepodařilo se TODO text')
  const showMessage = useShowMessage()

  const rejectApplicationWithModal = async (data: {
    event: { id: number; name: string }
    application: { id: number; first_name: string; last_name: string }
  }) => {
    // replace with custom ui
    const isConfirmed = await new Promise((resolve, reject) => {
      confirmAlert({
        customUI: ({ title, message, onClose }) => (
          <div className={modalStyles.modal}>
            <div className={modalStyles.content}>
              <header className={modalStyles.modalTitleBox}>{title}</header>
              <div className={modalStyles.modalFormBox}>
                <div className={modalStyles.infoBox}>{message}</div>
                <Actions>
                  <Button
                    secondary
                    onClick={() => {
                      resolve(false)
                      onClose()
                    }}
                  >
                    Zruš
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      resolve(true)
                      onClose()
                    }}
                  >
                    Pokračuj
                  </Button>
                </Actions>
              </div>
            </div>
          </div>
        ),
        title: `Mažeš TODO text applikace ${data.application.first_name}`,
        message:
          'TODO text Všechna data budou navždy ztracena. Chceš pokračovat?',
      })
    })
    if (isConfirmed) {
      await updateApplication({
        id: data.application.id,
        eventId: data.event.id,
        patchedEventApplication: {
          state: 'rejected',
        },
      }).unwrap()
      showMessage({
        message: 'TODO text Prihlaska byla úspěšně smazána',
        type: 'success',
      })
    }
  }
  return [rejectApplicationWithModal, states] as const
}
