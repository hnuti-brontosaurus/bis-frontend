import {
  AddressPayload,
  HealthInsuranceCompany,
  UserPayload,
} from 'app/services/bisTypes'
import dayjs from 'dayjs'
import { merge, pick } from 'lodash'
import { normalizeString } from 'utils/helpers'
import { UserImport } from '../EventForm/steps/registration/Participants'

export const import2payload = (
  data: UserImport,
  {
    healthInsuranceCompanies,
  }: { healthInsuranceCompanies: HealthInsuranceCompany[] },
): UserPayload => {
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
  }

  const phone = String(data.phone ?? '')

  const close_person = data.close_person?.first_name
    ? merge({}, data.close_person, {
        phone: String(data.close_person?.phone),
      })
    : null

  const birthday = dayjs(data.birthday, 'D.M.YYYY').format('YYYY-MM-DD')

  const address = parseAddress(data.address)
  const contact_address = data.contact_address?.trim()
    ? parseAddress(data.contact_address)
    : null

  const health_insurance_company = data.health_insurance_company
    ? healthInsuranceCompanies.find(
        company =>
          normalizeString(company.slug) ===
          normalizeString(data.health_insurance_company),
      )?.id ?? null
    : null

  return merge(defaultFields, originalFields, {
    birthday,
    phone,
    close_person,
    address,
    contact_address,
    health_insurance_company,
  })
}

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
