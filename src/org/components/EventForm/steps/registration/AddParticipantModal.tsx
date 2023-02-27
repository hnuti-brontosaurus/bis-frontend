import { yupResolver } from '@hookform/resolvers/yup'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import { EventApplication, User, UserPayload } from 'app/services/bisTypes'
import classNames from 'classnames'
import {
  Button,
  ErrorBox,
  FormInputError,
  InlineSection,
  Label,
  Loading,
  StyledModal,
} from 'components'
import stylesTable from 'components/Table.module.scss'
import dayjs from 'dayjs'
import { FC, FormEventHandler, Fragment, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FaAt, FaBirthdayCake, FaPhoneAlt } from 'react-icons/fa'
import Tooltip from 'react-tooltip-lite'
import colors from 'styles/colors.module.scss'
import * as yup from 'yup'
import { ApplicationStates } from '../ParticipantsStep'
import { BirthdayInputCheck } from './BirthdayInputCheck'
import styles from './NewApplicationModal.module.scss'

interface INewApplicationModalProps {
  open: boolean
  onClose: () => void
  currentApplication: EventApplication
  eventId: number
  eventParticipants: string[]
  defaultUserData: EventApplication
}

const zipcodeRegExp = /\d{3} ?\d{2}/

const validationSchema = yup.object().shape(
  {
    first_name: yup.string().required().trim(),
    last_name: yup.string().required(),
    nickname: yup.string().trim(),
    email: yup.string().email().required('email or phone is required'),
    phone: yup.string().required(),
    birthday: yup
      .date()
      .required()
      .transform((curr, orig) => (orig === '' ? null : curr)),
    close_person: yup.object().shape({
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      email: yup.string().email().required('email or phone is required'),
      phone: yup.string().required(),
    }),
    address: yup.object().shape({
      street: yup.string().required(),
      city: yup.string().required(),
      zip_code: yup.string().required().matches(zipcodeRegExp),
    }),
  },
  [['email', 'phone']],
)

// TODO: This modal is still WIP (no need to review atm)
export const AddParticipantModal: FC<INewApplicationModalProps> = ({
  open,
  onClose,
  currentApplication,
  eventId,
  eventParticipants,
  defaultUserData,
}) => {
  const methods = useForm<UserPayload>({
    resolver: yupResolver(validationSchema),
  })

  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false)

  const [checkAndAdd, setCheckAndAdd] = useState(false)

  const [erroredSearchId, setErroredSearchId] = useState<string>()

  const [selectedUser, setSelectedUser] = useState<User>()

  const [, /* creatingANewUser */ setCreatingANewUser] = useState(false)
  const [check, setCheck] = useState(true)
  const [errorsCreatingUser, setErrorsCreatingUser] = useState<any>(undefined)
  const [retrievedUserIsUsed, setRetrievedUserIsUsed] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedUserInputBirthday, setSelectedUserInputBirthday] = useState<{
    first_name: string
    last_name: string
    birthday: string
  }>({ first_name: '', last_name: '', birthday: '' })

  const { data: categories } = api.endpoints.readEventCategories.useQuery()
  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods

  const { data: userOptions1, isFetching: isOptionsLoading1 } =
    api.endpoints.readUsers.useQuery({
      search: `${defaultUserData.first_name} ${defaultUserData.last_name}`,
    })

  const { data: userOptions2, isFetching: isOptionsLoading2 } =
    api.endpoints.readUsers.useQuery({
      search: `${defaultUserData.email?.split('@')[0]}`,
    })

  const { data: userOptions3, isFetching: isOptionsLoading3 } =
    api.endpoints.readUsers.useQuery(
      defaultUserData && defaultUserData.nickname
        ? {
            search: `${defaultUserData.nickname}`,
          }
        : skipToken,
    )

  const userOptionsDuplicates = [
    ...(userOptions1 ? userOptions1.results : []),
    ...(userOptions2 ? userOptions2.results : []),
    ...(userOptions3 ? userOptions3.results : []),
  ]

  const userOptions = Array.from(
    new Map(userOptionsDuplicates.map(item => [item['id'], item])).values(),
  )

  const userOptionsSearchIds = new Set(userOptions.map(u => u._search_id))

  const isOptionsLoading =
    isOptionsLoading1 || isOptionsLoading2 || isOptionsLoading3

  const { data: allUsersData, isFetching: isAllUsersLoading } =
    api.endpoints.readAllUsers.useQuery({
      search: `${defaultUserData.first_name} ${defaultUserData.last_name}`,
    })

  const allUsersDuplicates = allUsersData?.results ? allUsersData.results : []

  const allUsers = allUsersDuplicates.filter(
    u => !userOptionsSearchIds.has(u._search_id),
  )

  useEffect(() => {
    reset({
      // TODO: fix pronoun type
      ...(defaultUserData as unknown as Partial<UserPayload>),
      birthday: defaultUserData.birthday || undefined,
    })
  }, [defaultUserData, reset])

  const isTheSameEmail = (
    email: string | null | undefined,
    emailsList: (string | null | undefined)[],
  ) => {
    if (!email || !emailsList) return false
    const filteredEmails = emailsList.filter(e => e && e === email)
    return filteredEmails.length >= 1
  }

  const [createUser, { isLoading: isCreatingUser }] =
    api.endpoints.createUser.useMutation()

  const { data: retrievedUser, error: inlineUserError } =
    api.endpoints.readUserByBirthdate.useQuery(
      selectedUserInputBirthday &&
        selectedUserInputBirthday.birthday.length === 10
        ? selectedUserInputBirthday
        : skipToken,
    )
  const [patchEvent] = api.endpoints.updateEvent.useMutation()

  const [updateApplication] = api.endpoints.updateEventApplication.useMutation()
  const addParticipant = async (newParticipantId: string) => {
    let newParticipants = [...eventParticipants]
    newParticipants.push(newParticipantId)

    await patchEvent({
      id: eventId,
      event: {
        record: {
          participants: newParticipants,
          contacts: [],
          number_of_participants: null,
          number_of_participants_under_26: null,
        },
      },
    })
  }
  const handleFormSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.stopPropagation()

    handleSubmit(async data => {
      if (currentApplication.id) {
        let newParticipant: User
        try {
          setErrorsCreatingUser(undefined)

          newParticipant = await createUser({
            ...data,
            offers: null, //{ programs: [], organizer_roles: [], team_roles: [] },
            birthday: dayjs(data.birthday).format('YYYY-MM-DD'),
            donor: null,
            eyca_card: null,
            contact_address: null,
          } as UserPayload).unwrap()
          await addParticipant(newParticipant.id)
          await updateApplication({
            id: currentApplication.id,
            eventId: eventId,
            patchedEventApplication: {
              user: newParticipant.id,
              state: ApplicationStates.approved,
            },
          })
          onClose()
          clearModalData()
        } catch (e) {
          setErrorsCreatingUser(e)
        }
      }
    })(e)
  }

  const clearModalData = () => {
    setShowAddParticipantForm(false)
    setSelectedUser(undefined)
    setCreatingANewUser(false)
    setSelectedUserId('')
    setSelectedUserInputBirthday({
      first_name: '',
      last_name: '',
      birthday: '',
    })
    setErrorsCreatingUser(undefined)
    setCheckAndAdd(false)
    setErroredSearchId(undefined)
    setCheck(true)
    setRetrievedUserIsUsed(false)
  }
  if (!open) return null

  const onSubmitBD = async (
    data: { birthday: string },
    result: { searchId: string; first_name: string; last_name: string },
  ) => {
    setRetrievedUserIsUsed(true)
    if (check || checkAndAdd) {
      setSelectedUserId(result.searchId)
      setShowAddParticipantForm(false)
      setSelectedUserInputBirthday({ ...result, birthday: data.birthday })
      if (!retrievedUser || retrievedUser._search_id !== result.searchId) {
        setErroredSearchId(result.searchId)
      } else {
        setCheck(false)
      }
    }
    if (!check || checkAndAdd) {
      if (retrievedUser && retrievedUser._search_id === result.searchId) {
        addParticipant(retrievedUser.id)

        await updateApplication({
          id: currentApplication.id,
          eventId: eventId,
          patchedEventApplication: {
            user: retrievedUser.id,
            state: ApplicationStates.approved,
          },
        })
        clearModalData()
        onClose()
      }
    }
  }

  return (
    <StyledModal
      open={open}
      onClose={() => {
        onClose()
        clearModalData()
      }}
      title="Přidání účastníka"
    >
      <div
        onClick={e => {
          e.stopPropagation()
        }}
        className={styles.addParticipantModal}
      >
        {userOptions.length === 0 && allUsers.length === 0 ? (
          <div className={styles.infoBox}>
            Podle data z přihlášky jsme nenašli žádné uživatele, kteří už mají
            svůj účet v BISu.{' '}
          </div>
        ) : (
          <div className={styles.infoBox}>
            Podle data z přihlášky jsme našli následující uživatele, kteří už
            mají svůj účet v BISu:{' '}
            <p>Zelení - uživatelé, ke kterým máš přístup</p>
            <p>
              Šedí - uživatelé, ke kterým nemáš přístup; a musíš zadat datum
              narození, abys je mohl(a) přidat jako účastníky
            </p>
          </div>
        )}

        <div>
          <div
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div className={styles.usersList}>
              {!(isOptionsLoading || isAllUsersLoading) ? (
                <table className={classNames(stylesTable.table, styles.table)}>
                  <tbody>
                    {userOptions.length !== 0 && (
                      <tr>
                        <td colSpan={6}>
                          {' '}
                          {showAddParticipantForm ? (
                            <h3
                              onClick={() => {
                                setShowAddParticipantForm(false)
                              }}
                            >
                              Uživatelé přítomní v BISu +
                            </h3>
                          ) : (
                            <h3>Uživatelé přítomní v BISu</h3>
                          )}
                        </td>
                      </tr>
                    )}
                    {!showAddParticipantForm &&
                      userOptions.length !== 0 &&
                      userOptions?.map(result => (
                        <Fragment key={result.id}>
                          <tr className={styles.myUsers}>
                            <td className={styles.displayName}>
                              <div>{result.display_name}</div>
                            </td>
                            <td>
                              <Tooltip
                                useDefaultStyles
                                hoverDelay={
                                  currentApplication.birthday &&
                                  result.birthday &&
                                  currentApplication.birthday !==
                                    result.birthday
                                    ? 0
                                    : 10000
                                }
                                content={`${currentApplication.birthday}/${result.birthday}`}
                              >
                                <FaBirthdayCake
                                  color={
                                    currentApplication.birthday &&
                                    result.birthday
                                      ? currentApplication.birthday ===
                                        result.birthday
                                        ? colors.bronto
                                        : colors.error
                                      : colors.gray300
                                  }
                                />
                              </Tooltip>
                            </td>

                            <td>
                              <Tooltip
                                useDefaultStyles
                                hoverDelay={
                                  isTheSameEmail(currentApplication.email, [
                                    ...result.all_emails,
                                    result.email,
                                  ])
                                    ? 0
                                    : 10000
                                }
                                content={`${currentApplication.email}/${result.email}`}
                              >
                                <FaAt
                                  color={
                                    currentApplication.email &&
                                    (result.email ||
                                      (result.all_emails &&
                                        result.all_emails.length >= 1))
                                      ? isTheSameEmail(
                                          currentApplication.email,
                                          [...result.all_emails, result.email],
                                        )
                                        ? colors.bronto
                                        : colors.error
                                      : colors.gray300
                                  }
                                />
                              </Tooltip>
                            </td>
                            <td>
                              <Tooltip
                                useDefaultStyles
                                hoverDelay={
                                  currentApplication.phone &&
                                  result.phone &&
                                  currentApplication.phone !== result.phone
                                    ? 0
                                    : 10000
                                }
                                content={`${currentApplication.phone}/${result.phone}`}
                              >
                                <FaPhoneAlt
                                  color={
                                    currentApplication.phone && result.phone
                                      ? currentApplication.phone ===
                                        result.phone
                                        ? colors.bronto
                                        : colors.error
                                      : colors.gray300
                                  }
                                />
                              </Tooltip>
                            </td>
                            <td>
                              <Button
                                secondary
                                onClick={e => {
                                  e.preventDefault()

                                  setCreatingANewUser(false)
                                  setSelectedUser(result)
                                  reset(
                                    // TODO: fix pronoun type
                                    selectedUser as unknown as UserPayload,
                                  )
                                  setShowAddParticipantForm(true)
                                  setSelectedUserId(result._search_id)
                                  setShowAddParticipantForm(false)
                                }}
                              >
                                Ukaž
                              </Button>
                            </td>
                            <td>
                              <Button
                                primary
                                isLoading={
                                  retrievedUser &&
                                  result._search_id === retrievedUser._search_id
                                }
                                onClick={async e => {
                                  e.preventDefault()

                                  setCreatingANewUser(false)

                                  await addParticipant(result.id)

                                  await updateApplication({
                                    id: currentApplication.id,
                                    eventId: eventId,
                                    patchedEventApplication: {
                                      user: result.id,
                                      state: ApplicationStates.approved,
                                    },
                                  })
                                  onClose()
                                  clearModalData()
                                }}
                              >
                                {eventParticipants.includes(result.id)
                                  ? 'Přidáno, připojit další přihlášku'
                                  : 'Přidej'}
                              </Button>
                            </td>
                          </tr>
                          {result._search_id === selectedUserId && (
                            <tr>
                              <td colSpan={6}>
                                <>
                                  <span>Uživatel/ka: </span>
                                  <span>
                                    {result.first_name} {result.last_name}{' '}
                                    {result.nickname && `(${result.nickname})`}{' '}
                                  </span>
                                  {result.birthday && (
                                    <div>
                                      <span>Datum narození: </span>
                                      <span>{result.birthday}</span>
                                    </div>
                                  )}
                                  {result.pronoun?.name && (
                                    <div>
                                      <span>Oslovení: </span>
                                      <span>{result.pronoun.name}</span>
                                    </div>
                                  )}
                                  {result.email && (
                                    <div>
                                      <span>E-mail: </span>
                                      <span>{result.email}</span>
                                    </div>
                                  )}
                                  {result.phone && (
                                    <div>
                                      <span>Telefon: </span>
                                      <span>{result.phone}</span>
                                    </div>
                                  )}

                                  {result.health_issues && (
                                    <div>
                                      <span>Zdravotní omezení: </span>
                                      <span>{result.health_issues}</span>
                                    </div>
                                  )}
                                  {result.close_person && (
                                    <div>
                                      <span>Blízká osoba: </span>
                                      <span>{`${result.close_person.first_name} ${result.close_person.last_name}`}</span>
                                      {result.close_person.email && (
                                        <span>{` email: ${result.close_person.email}`}</span>
                                      )}
                                      {result.close_person.phone && (
                                        <span>{` tel: ${result.close_person.phone}`}</span>
                                      )}
                                    </div>
                                  )}
                                </>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    {!showAddParticipantForm &&
                      allUsers.length !== 0 &&
                      allUsers.map(result => (
                        <>
                          <tr
                            className={classNames(
                              styles.otherUsers,
                              erroredSearchId === result._search_id &&
                                styles.errorBirthdate,
                              retrievedUser &&
                                retrievedUserIsUsed &&
                                retrievedUser._search_id ===
                                  result._search_id &&
                                styles.successBirthdate,
                            )}
                          >
                            <td>{result.display_name}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td colSpan={2}>
                              <div
                                onClick={e => {
                                  e.stopPropagation()
                                }}
                              >
                                <BirthdayInputCheck
                                  defaultBirthday={currentApplication.birthday}
                                  onSubmitBD={onSubmitBD}
                                  result={result}
                                  erroredSearchId={erroredSearchId}
                                  inlineUserError={inlineUserError}
                                  retrievedUser={retrievedUser}
                                  retrievedUserIsUsed={retrievedUserIsUsed}
                                  setCheckAndAdd={v => {
                                    setCheckAndAdd(v)
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                          {result._search_id === selectedUserId &&
                            retrievedUser &&
                            retrievedUser._search_id === result._search_id &&
                            retrievedUserIsUsed && (
                              <tr>
                                <td colSpan={6}>
                                  <>
                                    <span>Uživatel/ka: </span>
                                    <span>
                                      {retrievedUser.first_name}{' '}
                                      {retrievedUser.last_name}{' '}
                                      {retrievedUser.nickname &&
                                        `(${retrievedUser.nickname})`}{' '}
                                    </span>
                                    {retrievedUser.birthday && (
                                      <div>
                                        <span>Datum narození: </span>
                                        <span>{retrievedUser.birthday}</span>
                                      </div>
                                    )}
                                    {retrievedUser.memberships && (
                                      <div>
                                        <span>Členství: </span>
                                        <span>
                                          {retrievedUser.memberships.map(
                                            membership => {
                                              return (
                                                <>
                                                  {administrationUnits &&
                                                    categories && (
                                                      <div>
                                                        <>
                                                          <span>
                                                            {
                                                              administrationUnits.results.find(
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
                                                              categories.results.find(
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
                                                          <span>
                                                            {membership.year}
                                                          </span>
                                                        </>
                                                      </div>
                                                    )}
                                                </>
                                              )
                                            },
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {retrievedUser.pronoun?.name && (
                                      <div>
                                        <span>Oslovení: </span>
                                        <span>
                                          {retrievedUser.pronoun.name}
                                        </span>
                                      </div>
                                    )}
                                    {retrievedUser.email && (
                                      <div>
                                        <span>E-mail: </span>
                                        <span>{retrievedUser.email}</span>
                                      </div>
                                    )}
                                    {retrievedUser.phone && (
                                      <div>
                                        <span>Telefon: </span>
                                        <span>{retrievedUser.phone}</span>
                                      </div>
                                    )}
                                    {/* {retrievedUser.address.street && (
        <div>
          <span>Adresa: </span>
          <span>{`${retrievedUser.address.street || ''} ${
            retrievedUser.address.city || ''
          } ${retrievedUser.address.zip_code || ''} ${
            retrievedUser.address.region || ''
          }`}</span>
        </div>
      )} */}
                                    {retrievedUser.health_issues && (
                                      <div>
                                        <span>Zdravotní omezení: </span>
                                        <span>
                                          {retrievedUser.health_issues}
                                        </span>
                                      </div>
                                    )}
                                    {retrievedUser.close_person && (
                                      <div>
                                        <span>Blízká osoba: </span>
                                        <span>{`${retrievedUser.close_person.first_name} ${retrievedUser.close_person.last_name}`}</span>
                                        {retrievedUser.close_person.email && (
                                          <span>{` email: ${retrievedUser.close_person.email}`}</span>
                                        )}
                                        {retrievedUser.close_person.phone && (
                                          <span>{` tel: ${retrievedUser.close_person.phone}`}</span>
                                        )}
                                      </div>
                                    )}
                                  </>
                                </td>
                              </tr>
                            )}
                        </>
                      ))}
                    <tr>
                      <td colSpan={6}>
                        {' '}
                        <span>
                          {showAddParticipantForm ||
                          (userOptions &&
                            userOptions.length === 0 &&
                            allUsers &&
                            allUsers.length === 0) ? (
                            <h3>Přidej nového uživatele</h3>
                          ) : (
                            <h3
                              onClick={() => {
                                setCreatingANewUser(true)
                                reset({
                                  // TODO: fix pronoun issues
                                  ...(defaultUserData as unknown as Partial<UserPayload>),
                                  birthday:
                                    defaultUserData.birthday || undefined,
                                })
                                setShowAddParticipantForm(true)
                                setSelectedUserId('')
                                // TODO: is it possible to scroll to it?
                              }}
                            >
                              Přidej nového uživatele +
                            </h3>
                          )}
                        </span>
                      </td>
                    </tr>
                    {(showAddParticipantForm ||
                      (userOptions.length === 0 && allUsers.length === 0)) && (
                      <tr>
                        <td colSpan={6}>
                          <div>
                            <div>
                              <FormProvider {...methods}>
                                <form onSubmit={handleFormSubmit}>
                                  <>
                                    <InlineSection>
                                      <Label required>Jméno:</Label>
                                      <FormInputError>
                                        <input
                                          type="text"
                                          {...register('first_name', {
                                            required: true,
                                          })}
                                        />
                                      </FormInputError>
                                      {errors.first_name?.message}

                                      <Label required>Příjmení: </Label>
                                      <FormInputError>
                                        <input
                                          type="text"
                                          {...register('last_name')}
                                        />
                                      </FormInputError>

                                      <Label>Přezdívka:</Label>

                                      <input
                                        type="text"
                                        {...register('nickname')}
                                      />
                                    </InlineSection>
                                    {/* 
                                        <Label>
                                          
                                            Rodné příjmení:
                                            <input
                                              type="text"
                                              {...register('birth_name')}
                                            />
                                          
                                        </Label> */}
                                    <InlineSection>
                                      <Label>Telefon:</Label>
                                      <FormInputError>
                                        <input
                                          type="text"
                                          {...register('phone')}
                                        />
                                      </FormInputError>

                                      <Label>E-mail:</Label>
                                      <FormInputError>
                                        <input
                                          type="text"
                                          {...register('email')}
                                        />
                                      </FormInputError>
                                    </InlineSection>
                                    <InlineSection>
                                      <Label>Datum narození:</Label>

                                      <input
                                        type="date"
                                        {...register('birthday')}
                                      />
                                    </InlineSection>

                                    <h3>Blízká osoba:</h3>
                                    <InlineSection>
                                      <Label required>Jméno:</Label>
                                      <FormInputError>
                                        <input
                                          type="text"
                                          {...register(
                                            'close_person.first_name',
                                          )}
                                        />
                                      </FormInputError>

                                      <Label required>Příjmení:</Label>
                                      <FormInputError>
                                        <input
                                          type="text"
                                          {...register(
                                            'close_person.last_name',
                                          )}
                                        />
                                      </FormInputError>
                                    </InlineSection>
                                    <InlineSection>
                                      <Label required>Telefon:</Label>

                                      <input
                                        type="text"
                                        {...register('close_person.phone')}
                                      />

                                      <Label required>E-mail:</Label>

                                      <input
                                        type="text"
                                        {...register('close_person.email')}
                                      />
                                    </InlineSection>
                                    <InlineSection>
                                      {/* <Label>
                                          
                                            Health insurance:
                                            <input
                                              type="text"
                                              {...register(
                                                'health_insurance_company',
                                              )}
                                            />
                                          
                                        </Label> */}
                                      <Label>
                                        Alergie a zdravotní omezení:
                                      </Label>

                                      <input
                                        type="text"
                                        {...register('health_issues')}
                                      />
                                    </InlineSection>
                                    <InlineSection>
                                      <Label required>Oslovení:</Label>
                                      <Label htmlFor="male">Mužské</Label>
                                      <input
                                        id="male"
                                        type="radio"
                                        {...register('pronoun')}
                                        value={1}
                                      />
                                      <Label htmlFor="female">Ženské</Label>
                                      <input
                                        id="female"
                                        type="radio"
                                        {...register('pronoun')}
                                        value={2}
                                      />
                                      <Label htmlFor="other">Jiné</Label>
                                      <input
                                        id="other"
                                        type="radio"
                                        {...register('pronoun')}
                                        value={0}
                                      />
                                    </InlineSection>
                                    {/* 
                                        <Label>
                                          
                                            Odbira novinky:
                                            <input
                                              id="donor_subscribed_to_newsletter"
                                              type="checkbox"
                                              {...register(
                                                'donor.subscribed_to_newsletter',
                                              )}
                                              checked
                                            ></input>
                                          
                                        </Label> */}

                                    <h3>Trvalé bydliště:</h3>
                                    <InlineSection>
                                      <Label required>Ulice:</Label>
                                      <FormInputError>
                                        <input
                                          id="address_street"
                                          type="text"
                                          {...register('address.street')}
                                        />
                                      </FormInputError>

                                      <Label required>PSČ:</Label>
                                      <FormInputError>
                                        <input
                                          id="address_zip_code"
                                          type="text"
                                          {...register('address.zip_code')}
                                        />
                                      </FormInputError>
                                    </InlineSection>
                                    <InlineSection>
                                      <Label required>Město:</Label>
                                      <FormInputError>
                                        <input
                                          id="address_city"
                                          type="text"
                                          {...register('address.city')}
                                        />
                                      </FormInputError>
                                    </InlineSection>
                                    <Button
                                      secondary
                                      onClick={e => {
                                        e.preventDefault()
                                        setShowAddParticipantForm(false)
                                      }}
                                    >
                                      Zrušit
                                    </Button>
                                    <Button primary isLoading={isCreatingUser}>
                                      Vytvořit nového uživatele a přidat jako
                                      účastníka
                                    </Button>
                                    {errorsCreatingUser && (
                                      <ErrorBox
                                        error={errorsCreatingUser.data}
                                      ></ErrorBox>
                                    )}
                                  </>
                                </form>
                              </FormProvider>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <Loading>Hledáme existující uživatele</Loading>
              )}
            </div>
          </div>
        </div>
      </div>
    </StyledModal>
  )
}
