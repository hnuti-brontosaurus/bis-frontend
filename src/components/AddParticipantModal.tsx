import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { FC, FormEventHandler, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import Modal from 'react-modal'
import * as yup from 'yup'

import { api, UserPayload } from '../app/services/bis'
import { EventApplication, User } from '../app/services/testApi'
import styles from './AddParticipantModal.module.scss'
import FormInputError from './FormInputError'
import Loading from './Loading'

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
    defaultValues: {
      ...defaultUserData,
      birthday: defaultUserData.birthday || undefined,
      sex: defaultUserData.sex?.id ?? null,
    } as Partial<UserPayload>,
  })

  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User>()

  const [creatingANewUser, setCreatingANewUser] = useState(false)

  useEffect(() => {
    setShowAddParticipantForm(userOptions?.results?.length === 0 ? true : false)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods

  const { data: userOptions, isFetching: isOptionsLoading } =
    api.endpoints.readUsers.useQuery({
      search: `${defaultUserData.first_name} ${defaultUserData.last_name}`,
    })
  const [createUser, { isLoading: isCreatingUser }] =
    api.endpoints.createUser.useMutation()

  const [updateUser, { isLoading: isUpdateingUser }] =
    api.endpoints.updateUser.useMutation()

  const [patchEvent, { isLoading: isPatchingEvent }] =
    api.endpoints.updateEvent.useMutation()

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

        let newParticipants = [...eventParticipants]
        newParticipants.push(newParticipant.id)

        await patchEvent({
          id: eventId,
          event: {
            record: {
              participants: newParticipants,
            },
          },
        })
        onClose()
      }
    })(e)
  }
  if (!open) return null

  return (
    <Modal isOpen={open} onRequestClose={onClose} contentLabel="Example Modal">
      {isOptionsLoading && <Loading>Checking for existing users</Loading>}
      {userOptions?.results?.length ? (
        <div>
          <div
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <div>Chces pridad uzivatela:</div>
            <div>
              {userOptions?.results.map(result => (
                <div className={result.birthday ? styles.green : styles.gray}>
                  <div>{result.display_name}</div>
                  <div>{result.birthday}</div>
                  {result.birthday ? (
                    <button
                      onClick={() => {
                        setCreatingANewUser(false)
                        console.log(result)
                        setSelectedUser(result)
                        reset({ ...selectedUser, sex: selectedUser?.sex?.id })
                        setShowAddParticipantForm(true)
                      }}
                    >
                      Pridaj
                    </button>
                  ) : (
                    <>
                      <input type="text" placeholder="datum narozeni"></input>
                      <button
                        onClick={() => {
                          // check if i know his birthdate
                          setCreatingANewUser(false)
                          setSelectedUser(result)
                          reset({ ...selectedUser, sex: selectedUser?.sex?.id })
                          setShowAddParticipantForm(true)
                        }}
                      >
                        Pridaj
                      </button>
                    </>
                  )}
                </div>
              ))}
              <div>
                <button
                  onClick={() => {
                    setCreatingANewUser(true)
                    reset({
                      ...defaultUserData,
                      birthday: defaultUserData.birthday || undefined,
                      sex: defaultUserData.sex?.id,
                    } as Partial<UserPayload>)
                    setShowAddParticipantForm(true)
                  }}
                >
                  Pridaj noveho uzivatela
                </button>
              </div>
              <div>{/* <input type="checkbox"></input>je to dite */}</div>
            </div>
          </div>
        </div>
      ) : null}
      {showAddParticipantForm && (
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
                      <input type="text" {...register('close_person.phone')} />
                    </p>
                  </label>
                  <label>
                    <p>
                      E-mail:
                      <input type="text" {...register('close_person.email')} />
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
      )}
    </Modal>
  )
}

export default AddParticipantModal
