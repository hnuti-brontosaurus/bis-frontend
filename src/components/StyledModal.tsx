import { FC } from 'react'
import Modal from 'react-modal'
import styles from '../org/EventForm/steps/ParticipantsStep.module.scss'
import stylesModal from './NewApplicationModal.module.scss'

interface IShowApplicationModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: any
}

const StyledModal: FC<IShowApplicationModalProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  if (!open) return null

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      contentLabel={title}
      className={stylesModal.modal}
    >
      <div className={stylesModal.content}>
        <div className={stylesModal.modalTitleBox}>
          <div className={styles.showUserApplicationNameBox}>
            <h2>{title}</h2>
          </div>
        </div>
        <div className={stylesModal.modalFormBox}>{children}</div>
      </div>
    </Modal>
  )
}

export default StyledModal
