/**
 * We collect all the types that we need from testApi here
 * to be clearer in what we use and what we don't from there
 * and when we decide to fix some types, the change propagates application-wide
 */

import type { Optional, Overwrite } from 'utility-types'
import type * as original from './testApi'
export type {
  AdministrationUnit,
  Answer,
  DietCategory,
  EventApplication,
  EventContact,
  EventIntendedForCategory,
  EventProgramCategory,
  Finance,
  FinanceReceipt,
  HealthInsuranceCompany,
  LoginRequest,
  MembershipCategory,
  PatchedEvent,
  PatchedEventApplication,
  PronounCategory,
  Propagation,
  Qualification,
  QualificationCategory,
  Questionnaire,
  Record,
  Region,
  Registration,
  TokenResponse,
  User,
  UserAddress as Address,
  UserSearch,
  StateEnum,
} from './testApi'

export type OpportunityCategory = Overwrite<
  original.OpportunityCategory,
  { slug: Required<original.WebOpportunitiesListApiArg>['category'][0] }
>

export type EventCategory = Overwrite<
  original.EventCategory,
  { slug: Required<original.WebEventsListApiArg>['category'][0] }
>

export type EventGroupCategory = Overwrite<
  original.EventGroupCategory,
  { slug: Required<original.WebEventsListApiArg>['group'][0] }
>

export type Event = Overwrite<
  original.Event,
  { category: EventCategory; group: EventGroupCategory }
>

export type PropagationPayload = Overwrite<
  original.Propagation,
  { diets: number[] }
>

export type EventPayload = Omit<
  Event,
  'intended_for' | 'group' | 'category' | 'program' | 'propagation'
> & {
  group: number
  category: number
  program: number
  intended_for: number
  propagation?: PropagationPayload | null
}

export type PaginatedList<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

type CorrectImage = {
  small: string
  medium: string
  large: string
  original: string
}

export type EventPropagationImage = Overwrite<
  original.EventPropagationImage,
  { image: CorrectImage }
>

export type EventPropagationImagePayload = Optional<
  original.EventPropagationImage,
  'id'
>

export type EventPhoto = Overwrite<original.EventPhoto, { photo: CorrectImage }>
export type EventPhotoPayload = Optional<original.EventPhoto, 'id'>

export type Opportunity = Overwrite<
  original.Opportunity,
  { image: CorrectImage }
>
export type OpportunityPayload = Omit<
  Overwrite<original.Opportunity, { category: number }>,
  'id'
>

export type Location = Overwrite<
  original.Location,
  {
    gps_location?: { type: 'Point'; coordinates: [number, number] }
  }
>

export type AnswerPayload = Overwrite<original.Answer, { question: number }>

// TODO: add address
export type EventApplicationPayload = Pick<
  original.EventApplication,
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'email'
  | 'birthday'
  | 'note'
  | 'nickname'
  | 'close_person'
  | 'health_issues'
  | 'state'
> & { answers: AnswerPayload[] }

type AddressPayload = Omit<original.UserAddress, 'region'>

type UserPayloadFields =
  | 'first_name' // required
  | 'last_name' // required
  | 'birth_name'
  | 'nickname'
  | 'pronoun'
  | 'birthday' // required
  | 'email'
  | 'phone'
  | 'close_person'
  | 'address' // required
  | 'contact_address'
  | 'health_insurance_company'
  | 'health_issues'
  | 'all_emails'
  | 'subscribed_to_newsletter'

export type UserPayload = Overwrite<
  Pick<original.User, UserPayloadFields>,
  {
    pronoun: number | null
    address: AddressPayload
    contact_address: AddressPayload | null
    health_insurance_company: number | null
  }
>

export type QuestionType = 'text' | 'checkbox' | 'radio'

type QuestionData = {
  type: QuestionType
  options?: { option: string }[]
}

export type Question = Overwrite<
  original.Question,
  {
    data?: QuestionData
  }
>
