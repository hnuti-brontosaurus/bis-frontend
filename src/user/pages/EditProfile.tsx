import { yupResolver } from '@hookform/resolvers/yup'
import { api } from 'app/services/bis'
import { Address, User, UserPayload } from 'app/services/bisTypes'
import {
  Actions,
  BirthdayInput,
  birthdayValidation,
  Breadcrumbs,
  Button,
  FormInputError,
  FormSection,
  FormSectionGroup,
  FormSubsection,
  FullSizeElement,
  InlineSection,
  Label,
  Loading,
  PageHeader,
} from 'components'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import { useCurrentUser } from 'hooks/currentUser'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from 'hooks/persistForm'
import { useTitle } from 'hooks/title'
import { merge, omit, startsWith } from 'lodash'
import { FormEventHandler, useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Overwrite } from 'utility-types'
import * as yup from 'yup'

export type UserForm = Pick<
  Overwrite<
    User,
    {
      sex: number
      address: Overwrite<Address, { region: number }>
      contact_address: Overwrite<Address, { region: number }>
      health_insurance_company: number
      close_person: {
        first_name: string
        last_name: string
        email?: string
        phone?: string
      }
    }
  >,
  | 'first_name'
  | 'last_name'
  | 'birth_name'
  | 'nickname'
  | 'birthday'
  | 'sex'
  | 'health_insurance_company'
  | 'health_issues'
  | 'email'
  // TODO include other emails, too
  | 'phone'
  | 'address'
  | 'contact_address'
  | 'close_person'
>

// transform user data to initial form data
const data2form = (user: User): UserForm => {
  return merge({}, user, {
    sex: user.sex ? user.sex.id : 0,
    address: { region: user.address?.region?.id ?? 0 },
    contact_address: { region: user.contact_address?.region?.id ?? 0 },
    close_person: user.close_person ?? {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
    health_insurance_company: user.health_insurance_company?.id ?? 0,
  })
}

// transform form data to edit user payload
const form2payload = (data: UserForm): Partial<UserPayload> => {
  const address =
    data.address.city ||
    data.address.street ||
    data.address.zip_code ||
    Number(data.address.region)
      ? {
          ...data.address,
          region: Number(data.address.region),
        }
      : undefined

  const contact_address =
    data.contact_address.city ||
    data.contact_address.street ||
    data.contact_address.zip_code ||
    Number(data.contact_address.region)
      ? {
          ...data.contact_address,
          region: Number(data.contact_address.region),
        }
      : null

  const close_person =
    data.close_person?.email ||
    data.close_person?.first_name ||
    data.close_person?.last_name ||
    data.close_person?.phone
      ? data.close_person
      : null

  return merge(
    {},
    omit(
      data,
      'sex',
      'address',
      'contact_address',
      'health_insurance_company',
      'close_person',
    ),
    {
      sex: Number(data.sex) || null,
      address,
      contact_address,
      health_insurance_company: Number(data.health_insurance_company) || null,
      close_person,
    },
  )
}

// form validation schemata
const addressValidationSchema: yup.ObjectSchema<UserForm['address']> = yup
  .object()
  .shape(
    {
      street: yup.string().when(['city', 'zip_code', 'region'], {
        is: (city: string, zip: string, region: number) =>
          city || zip || Number(region),
        then: schema => schema.required(),
        otherwise: schema => schema.defined(),
      }),
      city: yup.string().when(['street', 'zip_code', 'region'], {
        is: (street: string, zip: string, region: number) =>
          street || zip || Number(region),
        then: schema => schema.required(),
        otherwise: schema => schema.defined(),
      }),
      zip_code: yup.string().when(['street', 'city', 'region'], {
        is: (street: string, city: string, region: number) =>
          street || city || Number(region),
        then: schema => schema.required(),
        otherwise: schema => schema.defined(),
      }),
      region: yup.number().defined(),
    },
    [
      ['street', 'city'],
      ['street', 'zip_code'],
      ['city', 'zip_code'],
    ],
  )
const validationSchema: yup.ObjectSchema<UserForm> = yup.object({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  birth_name: yup.string(),
  nickname: yup.string(),
  birthday: birthdayValidation.required(),
  sex: yup.number().required(),
  health_insurance_company: yup.number().required(),
  health_issues: yup.string(),
  email: yup.string().email().required(),
  phone: yup.string(),
  address: addressValidationSchema,
  contact_address: addressValidationSchema,
  close_person: yup
    .object()
    .shape(
      {
        first_name: yup.string().when(['last_name', 'email', 'phone'], {
          is: (lastName?: string, email?: string, phone?: string) =>
            lastName || email || phone,
          then: schema => schema.required(),
          otherwise: schema => schema.defined(),
        }),
        last_name: yup
          .string()
          .defined()
          .when(['first_name', 'email', 'phone'], {
            is: (firstName?: string, email?: string, phone?: string) =>
              firstName || email || phone,
            then: schema => schema.required(),
            otherwise: schema => schema.defined(),
          }),
        email: yup.string().email(),
        phone: yup.string(),
      },
      [['first_name', 'last_name']],
    )
    .defined(),
})

export const EditProfile = () => {
  const { user } = useOutletContext<{ user: User }>()
  const { data: currentUser } = useCurrentUser()
  const navigate = useNavigate()

  const title =
    currentUser?.id === user.id
      ? 'Upravit můj profil'
      : `Upravit profil uživatele ${user.display_name}`

  useTitle(title)

  const showMessage = useShowMessage()

  const [isSaving, setIsSaving] = useState(false)

  // fetch data for form
  const { data: sexes } = api.endpoints.readSexes.useQuery({})
  const { data: regions } = api.endpoints.readRegions.useQuery({
    pageSize: 100,
  })
  const { data: healthInsuranceCompanies } =
    api.endpoints.readHealthInsuranceCompanies.useQuery({ pageSize: 1000 })

  const [updateUser, { error }] = api.endpoints.updateUser.useMutation()

  useShowApiErrorMessage(error)

  const persistedData = usePersistentFormData('user', user.id)

  const methods = useForm<UserForm>({
    defaultValues: merge(data2form(user), persistedData),
    resolver: yupResolver(validationSchema),
  })
  const { register, watch, control, trigger, formState } = methods

  usePersistForm('user', user.id, watch)

  const clearForm = useClearPersistentForm('user', user.id)

  // validate form fields dependent on other fields
  // i wish there was a better way
  // maybe there is, but i haven't found it
  useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (formState.isSubmitted) {
        if (startsWith(name, 'address')) trigger('address')
        if (startsWith(name, 'contact_address')) trigger('contact_address')
        if (startsWith(name, 'close_person')) trigger('close_person')
      }
    })
    return subscription.unsubscribe
  }, [formState.isSubmitted, trigger, watch])

  const handleSubmit = methods.handleSubmit(async data => {
    try {
      setIsSaving(true)
      await updateUser({
        id: user.id,
        patchedUser: form2payload(data),
      }).unwrap()
      showMessage({ type: 'success', message: 'Změny byly úspěšně uloženy' })
      navigate('..')
      clearForm()
    } finally {
      setIsSaving(false)
    }
  })

  const handleCancel: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    navigate('..')
    clearForm()
  }

  if (!(sexes && regions && healthInsuranceCompanies))
    return <Loading>Připravujeme formulář</Loading>

  if (isSaving) return <Loading>Ukládáme změny</Loading>

  return (
    <>
      <Breadcrumbs userName={user.display_name} />
      <div>
        <PageHeader>{title}</PageHeader>
        <form onSubmit={handleSubmit} onReset={handleCancel}>
          <FormProvider {...methods}>
            <FormSectionGroup>
              <FormSection header="Osobní údaje">
                <InlineSection>
                  <Label required>Jméno</Label>
                  <FormInputError>
                    <input type="text" {...register('first_name')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label required>Příjmení</Label>
                  <FormInputError>
                    <input type="text" {...register('last_name')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Rodné příjmení</Label>
                  <FormInputError>
                    <input type="text" {...register('birth_name')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Přezdívka</Label>
                  <FormInputError>
                    <input type="text" {...register('nickname')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label required>Datum narození</Label>
                  <FormInputError>
                    <Controller
                      control={control}
                      name="birthday"
                      render={({ field }) => <BirthdayInput {...field} />}
                    />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Pohlaví</Label>
                  <FormInputError>
                    <select {...register('sex')}>
                      <option value={0}>Neuvedeno</option>
                      {sexes.results.map(sex => (
                        <option key={sex.slug} value={sex.id}>
                          {sex.name}
                        </option>
                      ))}
                    </select>
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Zdravotní pojišťovna</Label>
                  <FormInputError>
                    <select
                      style={{ width: '100%', maxWidth: '500px' }}
                      {...register('health_insurance_company')}
                    >
                      <option value={0}>&ndash;&ndash;&ndash;</option>
                      {healthInsuranceCompanies.results.map(hic => (
                        <option key={hic.slug} value={hic.id}>
                          {hic.name}
                        </option>
                      ))}
                    </select>
                  </FormInputError>
                </InlineSection>
                <FullSizeElement>
                  <Label>Alergie a zdravotní omezení</Label>
                  <textarea {...register('health_issues')} />
                </FullSizeElement>
              </FormSection>
              <FormSection header="Kontaktní údaje">
                <InlineSection>
                  <Label required>Email</Label>
                  <FormInputError>
                    <input type="email" {...register('email')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Telefon</Label>
                  <FormInputError>
                    <input type="tel" {...register('phone')} />
                  </FormInputError>
                </InlineSection>
                <FormSubsection header="Adresa" required>
                  <InlineSection>
                    <Label>Ulice a číslo domu</Label>
                    <FormInputError>
                      <input type="text" {...register('address.street')} />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label>Obec</Label>
                    <FormInputError>
                      <input type="text" {...register('address.city')} />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label>Směrovací číslo</Label>
                    <FormInputError>
                      <input type="text" {...register('address.zip_code')} />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label>Kraj</Label>
                    <FormInputError>
                      <select {...register('address.region')}>
                        <option value={0}>&ndash;&ndash;&ndash;</option>
                        {regions.results.map(region => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </FormInputError>
                  </InlineSection>
                </FormSubsection>
                <FormSubsection header="Kontaktní adresa">
                  <InlineSection>
                    <Label>Ulice a číslo domu</Label>
                    <FormInputError>
                      <input
                        type="text"
                        {...register('contact_address.street')}
                      />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label>Obec</Label>
                    <FormInputError>
                      <input
                        type="text"
                        {...register('contact_address.city')}
                      />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label>Směrovací číslo</Label>
                    <FormInputError>
                      <input
                        type="text"
                        {...register('contact_address.zip_code')}
                      />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label>Kraj</Label>
                    <FormInputError>
                      <select {...register('contact_address.region')}>
                        <option value={0}>&ndash;&ndash;&ndash;</option>
                        {regions.results.map(region => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </FormInputError>
                  </InlineSection>
                </FormSubsection>
              </FormSection>
              <FormSection header="Blízká osoba">
                <InlineSection>
                  <Label>Jméno</Label>
                  <FormInputError>
                    <input
                      type="text"
                      {...register('close_person.first_name')}
                    />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Příjmení</Label>
                  <FormInputError>
                    <input
                      type="text"
                      {...register('close_person.last_name')}
                    />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Email</Label>
                  <FormInputError>
                    <input type="email" {...register('close_person.email')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label>Telefon</Label>
                  <FormInputError>
                    <input type="tel" {...register('close_person.phone')} />
                  </FormInputError>
                </InlineSection>
              </FormSection>
            </FormSectionGroup>
            <Actions>
              <Button type="reset">Zrušit</Button>
              <Button primary type="submit">
                Uložit
              </Button>
            </Actions>
          </FormProvider>
        </form>
      </div>
    </>
  )
}
