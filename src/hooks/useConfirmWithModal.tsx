import { Actions, Button } from 'components'
import modalStyles from 'components/StyledModal/StyledModal.module.scss'
import { ReactNode, useCallback } from 'react'
import 'react-confirm-alert/src/react-confirm-alert.css'
import { useAwaitModal } from './useAwaitModal'

const ModalContent = ({
  onResolve,
  onReject,
  message,
}: {
  onResolve: () => void
  onReject: () => void
  message: ReactNode
}) => {
  return (
    <div className={modalStyles.modalFormBox}>
      <div className={modalStyles.infoBox}>{message}</div>
      <Actions>
        <Button
          secondary
          onClick={() => {
            onReject()
          }}
        >
          Zruš
        </Button>
        <Button
          danger
          onClick={() => {
            onResolve()
          }}
        >
          Pokračuj
        </Button>
      </Actions>
    </div>
  )
}

/**
 * A custom hook that shows a confirmation modal before executing a function.
 *
 * @param successMessage - Optional success message to show upon successful completion of the function.
 * @param errorMessage - Optional error message to show upon unsuccessful completion of the function.
 * @param title - The title of the confirmation modal.
 * @param message - The message to show in the confirmation modal.
 * @returns the confirmWithModal function
 */
export const useConfirmWithModal = ({
  title,
  message,
}: {
  title: string
  message: string
}) => {
  const [getModalData, modal] = useAwaitModal(ModalContent)

  /**
   * Shows a confirmation modal before executing the given function.
   *
   * @param onConfirm - The function to execute if the user confirms the action.
   */
  // const confirmWithModal = async (onConfirm: Function) => {
  //   // Show confirmation modal and wait for user input
  //   const isConfirmed = await new Promise(resolve => {
  //     confirmAlert({
  //       customUI: ({ title, message, onClose }) => (
  //         <div className={modalStyles.modal}>
  //           <div className={modalStyles.content}>
  //             <header className={modalStyles.modalTitleBox}>{title}</header>
  //           </div>
  //         </div>
  //       ),
  //       title,
  //       message,
  //     })
  //   })
  //   // If the user confirmed the action, execute the provided function and show the success message (if provided)
  //   if (isConfirmed) {
  //     await onConfirm()
  //   }
  // }

  const confirmWithModal = useCallback(
    (onConfirm: () => void, onCancel?: () => void) => {
      getModalData({
        title,
        props: { message } as {
          message: string
          onResolve: () => void
          onReject: () => void
        },
      })
        .then(onConfirm)
        .catch(onCancel)
    },
    [getModalData, message, title],
  )

  return [confirmWithModal, modal] as const
}
