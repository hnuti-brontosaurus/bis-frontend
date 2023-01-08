import * as translations from 'config/static/translations'
import { merge } from 'lodash'
export * from 'config/static/translations'

export const event = merge(
  {},
  translations.event,
  {
    propagation: translations.eventPropagation,
    registration: translations.eventRegistration,
    record: translations.eventRecord,
    finance: translations.eventFinance,
    participantInputType: 'Způsob zadání účastníků',
    images: translations.eventPropagationImage,
    questions: translations.question,
  },
  {
    propagation: {
      vip_propagation: translations.vIPEventPropagation,
    },
    registration: {
      questionnaire: translations.questionnaire,
    },
  },
  { 'main_image.image': 'Hlavní foto' },
)

export const user = merge({}, translations.user, {
  qualifications: translations.qualification,
  memberships: translations.membership,
  address: translations.userAddress,
  contact_address: translations.userContactAddress,
})
