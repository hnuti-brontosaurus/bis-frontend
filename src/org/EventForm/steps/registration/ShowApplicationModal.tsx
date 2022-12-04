import { skipToken } from '@reduxjs/toolkit/dist/query'
import { FC } from 'react'
import { api } from '../../../../app/services/bis'
import {
  AdministrationUnit,
  EventApplication,
  EventCategory,
  EventProgramCategory,
  User,
} from '../../../../app/services/testApi'
import StyledModal from '../../../../components/StyledModal'
import styles from '../ParticipantsStep.module.scss'

interface IShowApplicationModalProps {
  open: boolean
  onClose: () => void
  currentApplication?: EventApplication
  eventName: string
  eventId: number
  setCurrentApplicationId?: (v: number) => void
  setShowAddParticipantModal?: (v: boolean) => void
  deleteEventApplication?: ({
    applicationId,
    eventId,
  }: {
    applicationId: number
    eventId: number
  }) => void
  userId?: string
  categories: EventCategory[]
  programs: EventProgramCategory[]
  administrationUnits: AdministrationUnit[]
  currentParticipant?: User
  savedParticipants?: { [s: string]: string }
}

// TODO: This modal is still WIP (no need to review atm)
const ShowParticipantModal: FC<IShowApplicationModalProps> = ({
  open,
  onClose,
  currentApplication: currentApplicationProp,
  eventName,
  eventId,
  setCurrentApplicationId,
  setShowAddParticipantModal,
  deleteEventApplication,
  userId,
  categories,
  programs,
  administrationUnits,
  currentParticipant,
  savedParticipants,
}) => {
  if (!open) return null

  const {
    data: currentApplicationData,
    isFetching: isCurrentApplicationDataLoading,
  } = api.endpoints.readEventApplication.useQuery(
    currentParticipant && savedParticipants
      ? {
          eventId,
          applicationId: Number(savedParticipants[currentParticipant.id]),
        }
      : skipToken,
  )

  const currentApplication = currentApplicationProp || currentApplicationData

  const { data: user, isFetching: isUserLoading } =
    api.endpoints.readUser.useQuery(
      userId
        ? {
            id: userId,
          }
        : skipToken,
    )

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={`Prihlaska na akce ${eventName}`}
    >
      {currentApplication && (
        <div>
          {' '}
          <h3>Prihlaska:</h3>
          <div className={styles.showUserApplicationNameBox}>
            <h4>
              {currentApplication.first_name} {currentApplication.last_name}{' '}
              {currentApplication.nickname &&
                `(${currentApplication.nickname})`}{' '}
            </h4>
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
                <div>
                  <h4>{answer.question.question}</h4>
                </div>
                <div>{answer.answer}</div>
              </div>
            ))}
        </div>
      )}
      {userId && user && (
        <div>
          <div className={styles.addedUserBlock}>
            <h3>Uzivatel pridany na akce: </h3>
            <h4>
              {user.first_name} {user.last_name}{' '}
              {user.nickname && `(${user.nickname})`}{' '}
            </h4>
          </div>

          {user.birthday && (
            <div>
              <span>Datum narozeni: </span>
              <span>{user.birthday}</span>
            </div>
          )}
          {user.sex?.name && (
            <div>
              <span>Pohlavi: </span>
              <span>{user.sex.name}</span>
            </div>
          )}

          {user.email && (
            <div>
              <span>Email: </span>
              <span>{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div>
              <span>Telefon: </span>
              <span>{user.phone}</span>
            </div>
          )}
          {user.health_issues && (
            <div>
              <span>Zdravotni omezeni: </span>
              <span>{user.health_issues}</span>
            </div>
          )}
          {user.close_person && (
            <div>
              <span>Blizska osoba: </span>
              <span>{`${user.close_person.first_name} ${user.close_person.last_name}`}</span>
              {user.close_person.email && (
                <span>{` email: ${user.close_person.email}`}</span>
              )}
              {user.close_person.phone && (
                <span>{` tel: ${user.close_person.phone}`}</span>
              )}
            </div>
          )}
          {user.memberships && user.memberships.length !== 0 && (
            <div>
              <span>Clenstvi: </span>
              <span>
                {user.memberships.map(membership => {
                  return (
                    <>
                      {administrationUnits && categories && (
                        <div>
                          <>
                            <span>
                              {
                                administrationUnits.find(
                                  // @ts-ignore
                                  unit =>
                                    // @ts-ignore
                                    membership.administration_unit ===
                                    // @ts-ignore
                                    unit.id,
                                )?.name
                              }
                            </span>
                            <span>
                              {
                                categories.find(
                                  // @ts-ignore
                                  category =>
                                    // @ts-ignore
                                    membership.category ===
                                    // @ts-ignore
                                    category.id,
                                )?.name
                              }
                            </span>
                            <span>{' od: '}</span>
                            <span>{membership.year}</span>
                          </>
                        </div>
                      )}
                    </>
                  )
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </StyledModal>
  )
}

export default ShowParticipantModal
