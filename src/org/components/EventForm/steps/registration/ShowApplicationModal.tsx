import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import type {
  AdministrationUnit,
  EventApplication,
  MembershipCategory,
  User,
} from 'app/services/bisTypes'
import { StyledModal } from 'components'
import { FC, Fragment } from 'react'
import styles from '../ParticipantsStep.module.scss'

interface IShowApplicationModalProps {
  open: boolean
  onClose: () => void
  currentApplication?: EventApplication
  eventName: string
  eventId: number
  userId?: string
  categories: MembershipCategory[]
  administrationUnits: AdministrationUnit[]
  currentParticipant?: User
  savedParticipants?: { [s: string]: string[] }
}

// TODO: This modal is still WIP (no need to review atm)
export const ShowApplicationModal: FC<IShowApplicationModalProps> = ({
  open,
  onClose,
  currentApplication: currentApplicationProp,
  eventName,
  eventId,
  // setCurrentApplicationId,
  // setShowAddParticipantModal,
  // deleteEventApplication,
  userId,
  categories,
  administrationUnits,
  currentParticipant,
  savedParticipants,
}) => {
  const { data: currentApplicationData } =
    api.endpoints.readEventApplication.useQuery(
      currentParticipant &&
        savedParticipants &&
        savedParticipants[currentParticipant.id].length > 0
        ? {
            eventId,
            //TODO: add here showing an array of applications
            applicationId: Number(savedParticipants[currentParticipant.id][0]),
          }
        : skipToken,
    )

  const currentApplication = currentApplicationProp || currentApplicationData

  const { data: user } = api.endpoints.readUser.useQuery(
    userId
      ? {
          id: userId,
        }
      : skipToken,
  )

  // we'll also show last year membership till end of February
  // we want to give people time to register for the new year
  // and still show continuity of membership
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const currentMemberships = (user?.memberships ?? []).filter(
    membership =>
      membership.year === currentYear ||
      (currentMonth < 2 && membership.year === currentYear - 1),
  )
  // TODO consider showing historical memberships, too

  if (!open) return null

  return (
    <StyledModal
      open={open}
      onClose={onClose}
      title={`Přihláška na akci ${eventName}`}
    >
      {currentApplication && (
        <div>
          {' '}
          <h3>Přihláška:</h3>
          <div className={styles.showUserApplicationNameBox}>
            <h4>
              {currentApplication.first_name} {currentApplication.last_name}{' '}
              {currentApplication.nickname &&
                `(${currentApplication.nickname})`}{' '}
            </h4>
          </div>
          {currentApplication.birthday && (
            <div>
              <span>Datum narození: </span>
              <span>{currentApplication.birthday}</span>
            </div>
          )}
          {currentApplication.sex?.name && (
            <div>
              <span>Pohlaví: </span>
              <span>{currentApplication.sex.name}</span>
            </div>
          )}
          {currentApplication.email && (
            <div>
              <span>E-mail: </span>
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
              <span>Zdravotní omezení: </span>
              <span>{currentApplication.health_issues}</span>
            </div>
          )}
          {currentApplication.close_person && (
            <div>
              <span>Blízká osoba: </span>
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
              <div key={answer.question.id}>
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
            <h3>Uživatel přidaný na akci: </h3>
            <h4>
              {user.first_name} {user.last_name}{' '}
              {user.nickname && `(${user.nickname})`}{' '}
            </h4>
          </div>

          {user.birthday && (
            <div>
              <span>Datum narození: </span>
              <span>{user.birthday}</span>
            </div>
          )}
          {user.sex?.name && (
            <div>
              <span>Pohlaví: </span>
              <span>{user.sex.name}</span>
            </div>
          )}

          {user.email && (
            <div>
              <span>E-mail: </span>
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
              <span>Zdravotní omezení: </span>
              <span>{user.health_issues}</span>
            </div>
          )}
          {user.close_person && (
            <div>
              <span>Blízká osoba: </span>
              <span>{`${user.close_person.first_name} ${user.close_person.last_name}`}</span>
              {user.close_person.email && (
                <span>{` email: ${user.close_person.email}`}</span>
              )}
              {user.close_person.phone && (
                <span>{` tel: ${user.close_person.phone}`}</span>
              )}
            </div>
          )}
          {currentMemberships && currentMemberships.length !== 0 && (
            <div>
              <span>Členství: </span>
              <div>
                {currentMemberships.map(membership => {
                  return (
                    <Fragment
                      key={`${membership.year}-${membership.administration_unit}-${membership.category}`}
                    >
                      {administrationUnits && categories && (
                        <div>
                          {
                            administrationUnits.find(
                              unit =>
                                membership.administration_unit === unit.id,
                            )?.name
                          }
                          {' - '}
                          {
                            categories.find(
                              category =>
                                membership.category.id === category.id,
                            )?.name
                          }{' '}
                          ({membership.year})
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </StyledModal>
  )
}
