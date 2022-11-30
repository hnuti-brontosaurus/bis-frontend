import { FC } from 'react'
import Modal from 'react-modal'
import { EventApplication } from '../app/services/testApi'
import { ReactComponent as Bin } from '../assets/trash-solid.svg'
import { ReactComponent as AddUser } from '../assets/user-plus-solid.svg'
import styles from '../org/EventForm/steps/ParticipantsStep.module.scss'

interface IShowApplicationModalProps {
  open: boolean
  onClose: () => void
  currentApplication: EventApplication
  eventName: string
  eventId: number
  setCurrentApplicationId: (v: number) => void
  setShowAddParticipantModal: (v: boolean) => void
  deleteEventApplication: ({
    applicationId,
    eventId,
  }: {
    applicationId: number
    eventId: number
  }) => void
}

// TODO: This modal is still WIP (no need to review atm)
const ShowParticipantModal: FC<IShowApplicationModalProps> = ({
  open,
  onClose,
  currentApplication,
  eventName,
  eventId,
  setCurrentApplicationId,
  setShowAddParticipantModal,
  deleteEventApplication,
}) => {
  console.log(eventName, 'dzik')
  if (!open) return null
  console.log(currentApplication)
  return (
    <Modal isOpen={open} onRequestClose={onClose} contentLabel="Example Modal">
      <div>
        <h2>Prihlaska na akce {eventName}</h2>
        <div
          onClick={() => {
            setCurrentApplicationId(currentApplication.id)
            setShowAddParticipantModal(true)
          }}
        >
          <AddUser className={styles.addUserIconContainer} />
        </div>
        <div
          onClick={() => {
            deleteEventApplication({
              applicationId: currentApplication.id,
              eventId,
            })
          }}
        >
          {/* <div className={styles.binIconContainer}> */}
          <Bin className={styles.binIconContainer}></Bin>
          {/* </div> */}
        </div>
        <span>Prihlasena/y: </span>
        <span>
          {currentApplication.first_name} {currentApplication.last_name}{' '}
          {currentApplication.nickname && `(${currentApplication.nickname})`}{' '}
        </span>
      </div>

      {currentApplication.birthday && (
        <div>
          <span>Datum narozeni: </span>
          <span>{currentApplication.birthday}</span>
        </div>
      )}
      {currentApplication.sex?.name && (
        <div>
          <span>Pohlavi: </span>
          <span>{currentApplication.sex.name}</span>
        </div>
      )}

      {currentApplication.email && (
        <div>
          <span>Email: </span>
          <span>{currentApplication.email}</span>
        </div>
      )}
      {currentApplication.phone && (
        <div>
          <span>Telefon: </span>
          <span>{currentApplication.phone}</span>
        </div>
      )}
      {/* {currentApplication.address.street && (
        <div>
          <span>Adresa: </span>
          <span>{`${currentApplication.address.street || ''} ${
            currentApplication.address.city || ''
          } ${currentApplication.address.zip_code || ''} ${
            currentApplication.address.region || ''
          }`}</span>
        </div>
      )} */}
      {currentApplication.health_issues && (
        <div>
          <span>Zdravotni omezeni: </span>
          <span>{currentApplication.health_issues}</span>
        </div>
      )}
      {currentApplication.close_person && (
        <div>
          <span>Blizska osoba: </span>
          <span>{`${currentApplication.close_person.first_name} ${currentApplication.close_person.last_name}`}</span>
          {currentApplication.close_person.email && (
            <span>{` email: ${currentApplication.close_person.email}`}</span>
          )}
          {currentApplication.close_person.phone && (
            <span>{` tel: ${currentApplication.close_person.phone}`}</span>
          )}
        </div>
      )}
      {currentApplication.answers &&
        currentApplication.answers.map(answer => (
          <div>
            <div>{answer.question.question}</div>
            <div>{answer.answer}</div>
          </div>
        ))}
    </Modal>
  )
}

export default ShowParticipantModal
