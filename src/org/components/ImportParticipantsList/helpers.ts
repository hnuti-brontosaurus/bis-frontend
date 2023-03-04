import {
  AddressPayload,
  HealthInsuranceCompany,
  User,
  UserPayload,
} from 'app/services/bisTypes'
import { data2form, form2payload } from 'components/UserForm/UserForm'
import dayjs from 'dayjs'
import { merge, pick } from 'lodash'
import { normalizeString } from 'utils/helpers'
import { UserImport } from '../EventForm/steps/registration/Participants'

/**
 * Convert raw imported excel data into usable data
 *
 * In particular, parse addresses and other data,
 * convert health_insurance_company from its name to id,
 * merge with the fetched user
 * ...
 */
export const import2payload = (
  data: UserImport,
  {
    healthInsuranceCompanies,
    loaded,
  }: {
    healthInsuranceCompanies: HealthInsuranceCompany[]
    loaded: User | undefined
  },
): UserPayload & { id?: string } => {
  const originalFields = pick(
    data,
    'first_name',
    'last_name',
    'nickname',
    'birth_name',
    'health_issues',
    'email',
  )

  const defaultFields = {
    birth_name: '',
    nickname: '',
    health_issues: '',
    pronoun: null,
    subscribed_to_newsletter: true,
    donor: null,
    offers: null,
    eyca_card: null,
    // default imported fields
    first_name: '',
    last_name: '',
    email: null,
    phone: '',
    close_person: null,
    address: null,
    contact_address: null,
    health_insurance_company: null,
  }

  const phone = String(data.phone ?? '')

  const close_person = data.close_person?.first_name
    ? merge({}, data.close_person, {
        phone: String(data.close_person?.phone),
      })
    : null

  const birthday = dayjs(data.birthday, 'D.M.YYYY').format('YYYY-MM-DD')

  const address = data.address?.trim?.() ? parseAddress(data.address) : null
  const contact_address = data.contact_address?.trim?.()
    ? parseAddress(data.contact_address)
    : null

  const health_insurance_company = data.health_insurance_company
    ? healthInsuranceCompanies.find(
        company =>
          normalizeString(company.slug) ===
          normalizeString(data.health_insurance_company),
      )?.id ?? null
    : null

  const preparedFields = {
    ...originalFields,
    birthday,
    phone,
    close_person,
    address,
    contact_address,
    health_insurance_company,
  } as const

  const importedFields = Object.fromEntries(
    Object.entries(preparedFields).filter(([, value]) => Boolean(value)),
  ) as Partial<User>

  return merge(
    defaultFields,
    loaded && form2payload(data2form(loaded)),
    loaded?.id && { id: loaded.id },
    importedFields,
  )
}

/**
 * Parse address from string to address object
 *
 * It has to be in format
 * Street Number, Zip Code City
 * For example
 * Na Návsi 1, 76323 Horní Lhota
 * Vinohradská 1778/51a, 120 00 Praha 2
 */
const parseAddress = (input: string): AddressPayload => {
  input.split(/[,;]\s*/g)

  const addressRegex = /^(.*),\s*(\d{3}\s?\d{2})\s*(.*)$/

  const matches = addressRegex.exec(input)

  return {
    street: matches?.[1] ?? '',
    city: matches?.[3] ?? '',
    zip_code: matches?.[2] ?? '',
  }
}
