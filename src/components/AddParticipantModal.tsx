import { yupResolver } from '@hookform/resolvers/yup'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import dayjs from 'dayjs'
import { FC, FormEventHandler, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaAt, FaBirthdayCake, FaPhoneAlt } from 'react-icons/fa'
import Modal from 'react-modal'
import Tooltip from 'react-tooltip-lite'
import * as yup from 'yup'
import { api, UserPayload } from '../app/services/bis'
import { EventApplication, User } from '../app/services/testApi'
import colors from '../_colors.module.scss'
import { Button } from './Button'
import Loading from './Loading'
import styles from './NewApplicationModal.module.scss'
import stylesTable from './Table.module.scss'

interface INewApplicationModalProps {
  open: boolean
  onClose: () => void
  currentApplication: EventApplication
  eventId: number
  eventParticipants: string[]
  defaultUserData: EventApplication
}

const phoneRegExp = /^(\+|00){0,1}[0-9]{1,3}[0-9]{4,14}(?:x.+)?$/
const zipcodeRegExp = /\d{3} ?\d{2}/

const validationSchema = yup.object().shape(
  {
    first_name: yup.string().required('Required').trim(),
    last_name: yup.string().required('Required'),
    nickname: yup.string().trim(),
    email: yup
      .string()
      .email()
      .when('phone', {
        is: (phone: string) => !phone || phone.length === 0,
        then: schema => schema.email().required('email or phone is required'),
      }),
    phone: yup.string().when('email', {
      is: (email: string) => !email || email.length === 0,
      then: schema =>
        schema
          .when('phone', {
            is: (phone: string) => !phone || phone.length === 0,
            then: schema => schema.required('email or phone is required'),
          })
          .required()
          .matches(phoneRegExp, 'Phone number is not valid'),
    }),
    birthday: yup
      .date()
      .required()
      .transform((curr, orig) => (orig === '' ? null : curr)),
    close_person: yup.object().shape({
      first_name: yup.string().required(),
      last_name: yup.string().required(),
      email: yup.string().email().required('email or phone is required'),
    }),
    address: yup.object().shape({
      street: yup.string().required(),
      city: yup.string().required(),
      zip_code: yup.string().required().matches(zipcodeRegExp),
      region: yup.string().required(),
    }),
    contact_address: yup.object().shape({
      street: yup.string().required(),
      city: yup.string().required(),
      zip_code: yup.string().required().matches(zipcodeRegExp),
      region: yup.string().required(),
    }),
  },
  [['email', 'phone']],
)

// TODO: This modal is still WIP (no need to review atm)
const AddParticipantModal: FC<INewApplicationModalProps> = ({
  open,
  onClose,
  currentApplication,
  eventId,
  eventParticipants,
  defaultUserData,
}) => {
  const methods = useForm<UserPayload>({
    resolver: yupResolver(validationSchema),
    // defaultValues: {
    // ...(defaultUserData as Partial<UserPayload>),
    //   birthday: defaultUserData.birthday || undefined,
    // },
  })

  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User>()

  const [creatingANewUser, setCreatingANewUser] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedUserInputBirthday, setSelectedUserInputBirthday] = useState<{
    first_name: string
    last_name: string
    birthday: string
  }>({ first_name: '', last_name: '', birthday: '' })

  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: programs } = api.endpoints.getPrograms.useQuery()
  const { data: administrationUnits } =
    api.endpoints.getAdministrationUnits.useQuery({ pageSize: 2000 })

  const [addingUnknownParticipant, setAddingUnknownParticipant] =
    useState(false)

  useEffect(() => {
    setShowAddParticipantForm(userOptions?.length === 0 ? true : false)
  }, [])

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
    defaultUserData.nickname
      ? api.endpoints.readUsers.useQuery({
          search: `${defaultUserData.nickname}`,
        })
      : { data: { results: [] }, isFetching: false }

  console.log('nick 3', defaultUserData.nickname)
  console.log('user_options3', userOptions3)

  const userOptionsDuplicates = [
    ...(userOptions1 ? userOptions1.results : []),
    ...(userOptions2 ? userOptions2.results : []),
    ...(userOptions3 ? userOptions3.results : []),
  ]

  const userOptions = Array.from(
    new Map(userOptionsDuplicates.map(item => [item['id'], item])).values(),
  )

  const isOptionsLoading =
    isOptionsLoading1 || isOptionsLoading2 || isOptionsLoading3

  const { data: allUsers, isFetching: isAllUsersLoading } =
    api.endpoints.readAllUsers.useQuery({
      search: `${defaultUserData.first_name} ${defaultUserData.last_name}`,
    })

  console.log(
    'Alllllllss',
    `${defaultUserData.first_name} ${defaultUserData.last_name}`,
  )
  console.log('Alllllll', allUsers)

  const checkUserBirthdate = () => {
    setAddingUnknownParticipant(true)
  }

  const isTheSameEmail = (
    email: string | null | undefined,
    emailsList: (string | null | undefined)[],
  ) => {
    console.log(email, emailsList)
    if (!email || !emailsList) return false
    const filteredEmails = emailsList.filter(e => e && e === email)
    console.log('filtered', filteredEmails)
    return filteredEmails.length >= 1
  }

  const [createUser, { isLoading: isCreatingUser }] =
    api.endpoints.createUser.useMutation()

  const [updateUser, { isLoading: isUpdateingUser }] =
    api.endpoints.updateUser.useMutation()

  const { data: retrievedUser, isFetching: isGettingUserByBirthsdate } =
    api.endpoints.readUserByBirthdate.useQuery(
      selectedUserInputBirthday && addingUnknownParticipant
        ? selectedUserInputBirthday
        : skipToken,
    )

  console.log('HMMMMMMMMMM', selectedUserInputBirthday)
  console.log('WE GOT THIS', retrievedUser)
  const [patchEvent, { isLoading: isPatchingEvent }] =
    api.endpoints.updateEvent.useMutation()
  const addParticipant = async (newParticipantId: string) => {
    let newParticipants = [...eventParticipants]
    newParticipants.push(newParticipantId)

    await patchEvent({
      id: eventId,
      event: {
        record: {
          participants: newParticipants,
        },
      },
    })
  }
  const handleFormSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.stopPropagation()

    handleSubmit(async data => {
      if (currentApplication.id) {
        let newParticipant: User
        if (creatingANewUser || !selectedUser) {
          newParticipant = await createUser({
            ...data,
            offers: { programs: [], organizer_roles: [], team_roles: [] },
            birthday: dayjs(data.birthday).format('YYYY-MM-DD'),
          }).unwrap()
        } else {
          newParticipant = await updateUser({
            id: selectedUser?.id,
            patchedUser: {
              ...data,
              birthday: dayjs(data.birthday).format('YYYY-MM-DD'),
            },
          }).unwrap()
        }

        addParticipant(newParticipant.id)
        onClose()
        clearModalData()
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
    setAddingUnknownParticipant(false)
  }
  if (!open) return null

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => {
        onClose()
        clearModalData()
      }}
      contentLabel="Example Modal"
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div
        onClick={e => {
          e.stopPropagation()
        }}
        className={styles.content}
      >
        <div className={styles.modalTitleBox}>
          <h2>Pridavani ucastnika</h2>
        </div>
        <div className={styles.modalFormBox}>
          <div className={styles.infoBox}>
            Podle data z přihlášky jsme našli následující uživatele, kteří už
            mají svůj účet v BISu:{' '}
            <p>Zelení - uživatelé, ke kterým máš přístup</p>
            <p>
              Šedí - uživatelé, ke kterým nemáš přístup; a musíš zadat datum
              narození, abys je mohl(a) přidat jako účastníkynnn
            </p>
          </div>
          <h3>Uzivatele obecni v BISu</h3>
          <div>
            <div
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <div className={styles.usersList}>
                {!(isOptionsLoading || isAllUsersLoading) ? (
                  <table className={stylesTable.table}>
                    <tbody>
                      {userOptions?.map(result => (
                        <>
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
                                plain
                                onClick={e => {
                                  e.preventDefault()

                                  setCreatingANewUser(false)
                                  console.log(result)
                                  setSelectedUser(result)
                                  reset(selectedUser)
                                  setShowAddParticipantForm(true)
                                  setSelectedUserId(result._search_id)
                                }}
                              >
                                Ukaz
                              </Button>
                            </td>
                            <td>
                              <Button
                                plain
                                onClick={async e => {
                                  e.preventDefault()

                                  setCreatingANewUser(false)

                                  await addParticipant(result.id)
                                  onClose()
                                }}
                              >
                                Pridaj
                              </Button>
                            </td>
                          </tr>
                          {result._search_id === selectedUserId && (
                            <tr>
                              <td colSpan={6}>
                                <>
                                  <span>Uzivatel/ka: </span>
                                  <span>
                                    {result.first_name} {result.last_name}{' '}
                                    {result.nickname && `(${result.nickname})`}{' '}
                                  </span>
                                  {result.birthday && (
                                    <div>
                                      <span>Datum narozeni: </span>
                                      <span>{result.birthday}</span>
                                    </div>
                                  )}
                                  {result.sex?.name && (
                                    <div>
                                      <span>Pohlavi: </span>
                                      <span>{result.sex.name}</span>
                                    </div>
                                  )}
                                  {result.email && (
                                    <div>
                                      <span>Email: </span>
                                      <span>{result.email}</span>
                                    </div>
                                  )}
                                  {result.phone && (
                                    <div>
                                      <span>Telefon: </span>
                                      <span>{result.phone}</span>
                                    </div>
                                  )}
                                  {/* {result.address.street && (
        <div>
          <span>Adresa: </span>
          <span>{`${result.address.street || ''} ${
            result.address.city || ''
          } ${result.address.zip_code || ''} ${
            result.address.region || ''
          }`}</span>
        </div>
      )} */}
                                  {result.health_issues && (
                                    <div>
                                      <span>Zdravotni omezeni: </span>
                                      <span>{result.health_issues}</span>
                                    </div>
                                  )}
                                  {result.close_person && (
                                    <div>
                                      <span>Blizska osoba: </span>
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
                        </>
                      ))}
                      {allUsers?.results.map(result => (
                        <>
                          <tr className={styles.otherUsers}>
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
                                <form
                                  onSubmit={e => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    if (addingUnknownParticipant) {
                                      setAddingUnknownParticipant(false)
                                      if (retrievedUser)
                                        addParticipant(retrievedUser.id)
                                      onClose()
                                    } else {
                                      setAddingUnknownParticipant(true)
                                      // await checkUserBirthdate(, 'myvalue' )

                                      console.log('dziki')
                                      setSelectedUserId(result._search_id)

                                      const inputDate =
                                        // @ts-ignore
                                        e.target[result._search_id].value

                                      console.log(
                                        'ooooo',
                                        // @ts-ignore
                                        e.target[result._search_id].value,
                                      )

                                      setSelectedUserInputBirthday({
                                        first_name: result.first_name,
                                        last_name: result.last_name,
                                        birthday: dayjs(inputDate).format(
                                          'YYYY-MM-DD',
                                        ) as string,
                                      })
                                    }
                                  }}
                                >
                                  <input
                                    defaultValue={
                                      currentApplication.birthday || ''
                                    }
                                    name={`${result._search_id}`}
                                    id={`${result._search_id}`}
                                    className={styles.birthsdayInput}
                                    type="text"
                                    placeholder="datum narozeni"
                                  ></input>
                                  {addingUnknownParticipant ? (
                                    <Button
                                      className={styles.birthsdayButton}
                                      plain
                                      type="submit"
                                    >
                                      add user
                                    </Button>
                                  ) : (
                                    <Button
                                      className={styles.birthsdayButton}
                                      plain
                                      type="submit"
                                    >
                                      check birthdate
                                    </Button>
                                  )}
                                </form>
                              </div>
                            </td>
                          </tr>
                          {result._search_id === selectedUserId &&
                            retrievedUser && (
                              <tr>
                                <td colSpan={6}>
                                  <>
                                    <span>Uzivatel/ka: </span>
                                    <span>
                                      {retrievedUser.first_name}{' '}
                                      {retrievedUser.last_name}{' '}
                                      {retrievedUser.nickname &&
                                        `(${retrievedUser.nickname})`}{' '}
                                    </span>
                                    {retrievedUser.birthday && (
                                      <div>
                                        <span>Datum narozeni: </span>
                                        <span>{retrievedUser.birthday}</span>
                                      </div>
                                    )}
                                    {retrievedUser.memberships && (
                                      <div>
                                        <span>Clenstvi: </span>
                                        <span>
                                          {retrievedUser.memberships.map(
                                            membership => {
                                              console.log('member', membership)

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
                                    {retrievedUser.sex?.name && (
                                      <div>
                                        <span>Pohlavi: </span>
                                        <span>{retrievedUser.sex.name}</span>
                                      </div>
                                    )}
                                    {retrievedUser.email && (
                                      <div>
                                        <span>Email: </span>
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
                                        <span>Zdravotni omezeni: </span>
                                        <span>
                                          {retrievedUser.health_issues}
                                        </span>
                                      </div>
                                    )}
                                    {retrievedUser.close_person && (
                                      <div>
                                        <span>Blizska osoba: </span>
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
                          <button
                            onClick={() => {
                              setCreatingANewUser(true)
                              // reset({
                              //  ...(defaultUserData as Partial<UserPayload>),
                              //   birthday: defaultUserData.birthday || undefined,
                              // })
                              setShowAddParticipantForm(true)
                            }}
                          >
                            Pridaj noveho uzivatela
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6}></td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <Loading>Searching existing users</Loading>
                )}
              </div>
            </div>
          </div>
          {/* : <Loading>Searching for users</Loading> */}
          {/* {showAddParticipantForm && (
            <div>
              <div>
                <div>Add new participant</div>

                <FormProvider {...methods}>
                  <form onSubmit={handleFormSubmit}>
                    <>
                      <label>
                        <p>
                          Jmeno*:
                          <FormInputError>
                            <input
                              type="text"
                              {...register('first_name', { required: true })}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      {errors.first_name?.message}

                      <label>
                        <p>
                          Prijmeni*:
                          <FormInputError>
                            <input type="text" {...register('last_name')} />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        <p>
                          Prezdivka:
                          <input type="text" {...register('nickname')} />
                        </p>
                      </label>
                      <label>
                        <p>
                          Rodné příjmení:
                          <input type="text" {...register('birth_name')} />
                        </p>
                      </label>

                      <label>
                        <p>
                          Telefon:
                          <FormInputError>
                            <input type="text" {...register('phone')} />
                          </FormInputError>
                        </p>
                      </label>

                      <label>
                        <p>
                          E-mail:
                          <FormInputError>
                            <input type="text" {...register('email')} />
                          </FormInputError>
                        </p>
                      </label>

                      <label>
                        <p>
                          Datum narozeni:
                          <input type="date" {...register('birthday')} />
                        </p>
                      </label>

                      <h3>Bliska osoba:</h3>

                      <label>
                        <p>
                          Jmeno*:
                          <FormInputError>
                            <input
                              type="text"
                              {...register('close_person.first_name')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        <p>
                          Prijmeni*:
                          <FormInputError>
                            <input
                              type="text"
                              {...register('close_person.last_name')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        <p>
                          Telefon:
                          <input
                            type="text"
                            {...register('close_person.phone')}
                          />
                        </p>
                      </label>
                      <label>
                        <p>
                          E-mail:
                          <input
                            type="text"
                            {...register('close_person.email')}
                          />
                        </p>
                      </label>
                      <label>
                        <p>
                          Health insurance:
                          <input
                            type="text"
                            {...register('health_insurance_company')}
                          />
                        </p>
                      </label>
                      <label>
                        <p>
                          Alergie a zdravotni omezeni:
                          <input type="text" {...register('health_issues')} />
                        </p>
                      </label>
                      <label>
                        <p>
                          Pohlavi*:
                          <label htmlFor="male">Male</label>
                          <input
                            id="male"
                            type="radio"
                            {...register('sex')}
                            value={1}
                          />
                          <label htmlFor="female">Female</label>
                          <input
                            id="female"
                            type="radio"
                            {...register('sex')}
                            value={2}
                          />
                          <label htmlFor="other">Other</label>
                          <input
                            id="other"
                            type="radio"
                            {...register('sex')}
                            value={0}
                          />
                        </p>
                      </label>

                      <label>
                        <p>
                          Odbira novinky:
                          <input
                            id="donor_subscribed_to_newsletter"
                            type="checkbox"
                            {...register('donor.subscribed_to_newsletter')}
                            checked
                          ></input>
                        </p>
                      </label>

                      <h3>Trvala adresa:</h3>
                      <label>
                        Ulice*:
                        <p>
                          <FormInputError>
                            <input
                              id="address_street"
                              type="text"
                              {...register('address.street')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        PSC*:
                        <p>
                          <FormInputError>
                            <input
                              id="address_zip_code"
                              type="text"
                              {...register('address.zip_code')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        Mesto*:
                        <p>
                          <FormInputError>
                            <input
                              id="address_city"
                              type="text"
                              {...register('address.city')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        Region*:
                        <p>
                          <FormInputError>
                            <input
                              id="address_region"
                              type="text"
                              {...register('address.region')}
                            />
                          </FormInputError>
                        </p>
                      </label>

                      <h3>Kontaktni adresa:</h3>
                      <label>
                        Ulice*:
                        <p>
                          <FormInputError>
                            <input
                              type="text"
                              {...register('contact_address.street')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        PSC*:
                        <p>
                          <FormInputError>
                            <input
                              type="text"
                              {...register('contact_address.zip_code')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        Mesto*:
                        <p>
                          <FormInputError>
                            <input
                              type="text"
                              {...register('contact_address.city')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      <label>
                        Region*:
                        <p>
                          <FormInputError>
                            <input
                              type="text"
                              {...register('contact_address.region')}
                            />
                          </FormInputError>
                        </p>
                      </label>
                      {creatingANewUser ? (
                        <input
                          type="submit"
                          value="Create a new user and add as a participant"
                        />
                      ) : (
                        <input
                          type="submit"
                          value="Update existing user and add as a participant"
                        />
                      )}
                    </>
                  </form>
                </FormProvider>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </Modal>
  )
}

export default AddParticipantModal
