import { yupResolver } from '@hookform/resolvers/yup'
import { api } from 'app/services/bis'
import { User, UserPayload } from 'app/services/bisTypes'
import {
  Actions,
  BirthdayInput,
  birthdayValidation,
  Button,
  FormInputError,
  FormSection,
  FormSectionGroup,
  FormSubsection,
  FullSizeElement,
  InlineSection,
  Label,
  Loading,
} from 'components'
import { useShowMessage } from 'features/systemMessage/useSystemMessage'
import { merge, omit, startsWith } from 'lodash'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { requiredSelect } from 'utils/validationMessages'
import * as yup from 'yup'

/**
 * Expected fields are defined here:
 * https://docs.google.com/document/d/1hXfz0NhBL8XrUOEJR5VmuoDOwNADxEo3j5gA5knE1GE/edit?usp=drivesdk
 */

export type UserFormShape = Omit<UserPayload, 'all_emails'>

// transform user data to initial form data
const data2form = (user: User): UserFormShape => {
  return merge({}, user, {
    sex: user.sex?.id ?? 0,
    address: { region: user.address?.region?.id ?? 0 },
    contact_address: { region: user.contact_address?.region?.id },
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
const form2payload = (data: UserFormShape): Partial<UserPayload> => {
  const contact_address =
    data.contact_address?.city &&
    data.contact_address?.street &&
    data.contact_address?.zip_code &&
    Number(data.contact_address?.region)
      ? data.contact_address
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
      'contact_address',
      'health_insurance_company',
      'close_person',
    ),
    {
      sex: Number(data.sex) || null,
      contact_address,
      health_insurance_company: Number(data.health_insurance_company) || null,
      close_person,
    },
  )
}

// form validation schemata
const addressValidationSchema: yup.ObjectSchema<UserFormShape['address']> = yup
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
      region: yup.number().when(['street', 'city', 'zip_code'], {
        is: (street: string, city: string, zip: string) =>
          street || city || zip,
        then: schema => schema.required(requiredSelect).min(1, requiredSelect),
        otherwise: schema => schema.defined(),
      }),
    },
    [
      ['street', 'city'],
      ['street', 'zip_code'],
      ['street', 'region'],
      ['city', 'zip_code'],
      ['city', 'region'],
      ['zip_code', 'region'],
    ],
  )

const validationSchema: yup.ObjectSchema<UserFormShape> = yup.object({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  birth_name: yup.string(),
  nickname: yup.string(),
  birthday: birthdayValidation.required(),
  sex: yup.number().required(), // this is optional - none is 0
  health_insurance_company: yup.number().required(), // this is optional - none is 0
  health_issues: yup.string(),
  email: yup.string().email(),
  phone: yup.string(),
  address: yup
    .object()
    .shape({
      street: yup.string().required(),
      city: yup.string().required(),
      zip_code: yup.string().required(),
      region: yup.number().required(requiredSelect).min(1, requiredSelect),
    })
    .required(),
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

export const UserForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: UserPayload) => void
  onCancel: () => void
}) => {
  const showMessage = useShowMessage()

  // fetch data for form
  const { data: sexes } = api.endpoints.readSexes.useQuery({})
  const { data: regions } = api.endpoints.readRegions.useQuery({
    pageSize: 100,
  })
  const { data: healthInsuranceCompanies } =
    api.endpoints.readHealthInsuranceCompanies.useQuery({ pageSize: 1000 })

  // const persistedData = usePersistentFormData('user', user.id)

  const methods = useForm<UserFormShape>({
    defaultValues: { sex: 0, health_insurance_company: 0 },
    resolver: yupResolver(validationSchema),
  })
  const { register, watch, control, trigger, formState, handleSubmit } = methods

  // usePersistForm('user', user.id, watch)

  // const clearForm = useClearPersistentForm('user', user.id)

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

  const handleFormSubmit = handleSubmit(
    data => onSubmit(form2payload(data) as UserPayload),
    errors => {
      showMessage({
        type: 'error',
        message: 'Opravte, prosím, chyby ve validaci',
      })
    },
  )

  if (!(regions && sexes && healthInsuranceCompanies))
    return <Loading>Připravujeme formulář</Loading>

  return (
    <form onSubmit={handleFormSubmit} onReset={onCancel}>
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
              <Label>Email</Label>
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
                  <input type="text" {...register('contact_address.street')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label>Obec</Label>
                <FormInputError>
                  <input type="text" {...register('contact_address.city')} />
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
                <input type="text" {...register('close_person.first_name')} />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label>Příjmení</Label>
              <FormInputError>
                <input type="text" {...register('close_person.last_name')} />
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
            Potvrdit
          </Button>
        </Actions>
      </FormProvider>
    </form>
  )
}
