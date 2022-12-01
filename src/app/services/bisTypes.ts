/**
 * We collect all the types that we need from testApi here
 * to be clearer in what we use and what we don't from there
 * and when we decide to fix some types, the change propagates application-wide
 */

import type { Overwrite } from 'utility-types'
import type * as original from './testApi'
export type {
  AdministrationUnit,
  Answer,
  DietCategory,
  EventApplication,
  EventGroupCategory,
  EventIntendedForCategory,
  EventPhoto,
  EventProgramCategory,
  EventPropagationImage,
  Finance,
  FinanceReceipt,
  HealthInsuranceCompany,
  Location,
  Opportunity,
  OpportunityCategory,
  Propagation,
  Qualification,
  QualificationCategory,
  Question,
  Questionnaire,
  Record,
  Region,
  Registration,
  SexCategory,
  User,
  UserAddress as Address,
} from './testApi'

export type EventCategory = Overwrite<
  original.EventCategory,
  { slug: Required<original.WebEventsListApiArg>['category'][0] }
>

export type Event = Overwrite<original.Event, { category: EventCategory }>
