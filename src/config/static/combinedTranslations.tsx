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
