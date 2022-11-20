import { merge } from 'lodash'
import pick from 'lodash/pick'
import { FC, useMemo } from 'react'
import { FieldErrorsImpl, useForm, UseFormReturn } from 'react-hook-form'
import { DeepPick } from 'ts-deep-pick'
import type { Assign, Optional, Overwrite } from 'utility-types'
import { api, CorrectLocation, EventPayload } from '../app/services/bis'
import {
  EventPhoto,
  EventPropagationImage,
  FinanceReceipt,
  Question,
} from '../app/services/testApi'
import Loading from '../components/Loading'
import { NewLocation } from '../components/SelectLocation'
import { SimpleStep as Step, SimpleSteps as Steps } from '../components/Steps'
import { useShowMessage } from '../features/systemMessage/useSystemMessage'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from '../hooks/persistForm'
import {
  getIdBySlug,
  getIdsBySlugs,
  hasFormError,
  joinDateTime,
  pickErrors,
} from '../utils/helpers'
import BasicInfoStep from './EventForm/steps/BasicInfoStep'
import EventCategoryStep from './EventForm/steps/EventCategoryStep'
import EventDetailsStep from './EventForm/steps/EventDetailsStep'
import IntendedForStep from './EventForm/steps/IntendedForStep'
import LocationStep from './EventForm/steps/LocationStep'
import OrganizerStep from './EventForm/steps/OrganizerStep'
import ParticipantsStep from './EventForm/steps/ParticipantsStep'
import PropagationStep from './EventForm/steps/PropagationStep'
import RegistrationStep from './EventForm/steps/RegistrationStep'

const steps = [
  'category',
  'basicInfo',
  'intendedFor',
  'registration',
  'location',
  'propagation',
  'details',
  'organizers',
] as const

type StepName = typeof steps[number]

export type EventFormShape = //UnionToIntersection<StepShapes[keyof StepShapes]>
  Assign<
    EventPayload,
    {
      questions: Optional<Question, 'id' | 'order'>[]
      recordData: {
        photos: Optional<EventPhoto, 'id'>[]
        receipts: Optional<FinanceReceipt, 'id'>[]
      }
      startDate: string
      startTime: string
      location: NewLocation | Pick<CorrectLocation, 'id'> | null
      // online is an internal variable
      // it doesn't get sent to API
      // we only keep track of whether to save location or online_link
      online: boolean
      main_image: Optional<EventPropagationImage, 'id' | 'order'>
      images: Optional<EventPropagationImage, 'id' | 'order'>[]
    }
  >

const shapes = {
  category: ['group'],
  basicInfo: [
    'name',
    'start',
    'startDate',
    'startTime',
    'end',
    'number_of_sub_events',
    'category',
    'program',
    'administration_units',
  ],
  intendedFor: [
    'intended_for',
    'propagation.vip_propagation.goals_of_event',
    'propagation.vip_propagation.program',
    'propagation.vip_propagation.short_invitation_text',
    'propagation.vip_propagation.rover_propagation',
  ],
  registration: [
    'is_internal',
    'propagation.is_shown_on_web',
    'registration',
    'questions',
  ],
  location: ['location', 'online', 'online_link'],
  propagation: [
    'propagation.cost',
    'propagation.minimum_age',
    'propagation.maximum_age',
    'propagation.accommodation',
    'propagation.diets',
    'propagation.working_hours',
    'propagation.working_days',
    'propagation.web_url',
  ],
  details: [
    'internal_note',
    'propagation.invitation_text_introduction',
    'propagation.invitation_text_practical_information',
    'propagation.invitation_text_work_description',
    'propagation.invitation_text_about_us',
    'main_image',
    'images',
  ],
  organizers: [
    'main_organizer',
    'other_organizers',
    'propagation.contact_person',
    'propagation.contact_name',
    'propagation.contact_email',
    'propagation.contact_phone',
  ],
} as const

type ShapeTypes = {
  [Property in keyof typeof shapes]: typeof shapes[Property][number]
}

export type StepShapes = Overwrite<
  {
    [Property in StepName]: DeepPick<EventFormShape, ShapeTypes[Property]>
  },
  {
    location: Assign<
      DeepPick<EventFormShape, ShapeTypes['location']>,
      Pick<EventFormShape, 'location'>
    >
  }
>

export type MethodsShapes = {
  [K in keyof StepShapes]: UseFormReturn<StepShapes[K]>
}

type ErrorShapes = {
  [K in StepName]: FieldErrorsImpl<StepShapes[K]>
}

const EventForm: FC<{
  initialData?: Partial<EventFormShape>
  onSubmit: (data: EventFormShape) => Promise<void>
  onCancel: () => void
  eventToEdit: boolean
  id: string
}> = ({ onSubmit, onCancel, initialData, eventToEdit, id }) => {
  const savedData = usePersistentFormData('event', id)

  const initialAndSavedData = useMemo(
    () =>
      merge(
        { number_of_sub_events: 1 },
        initialData,
        { online: initialData?.online_link ? true : false },
        savedData,
      ),
    [initialData, savedData],
  )

  const methods = steps.reduce((prev, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const methods = useForm<StepShapes[typeof key]>({
      defaultValues: pick(initialAndSavedData, shapes[key]),
    })
    prev[key] = methods as any

    return prev
  }, {} as MethodsShapes)

  usePersistForm('event', id, ...Object.values(methods).map(m => m.watch))

  const showMessage = useShowMessage()

  // we're loading these to make sure that we have the data before we try to render the form, to make sure that the default values are properly initialized
  // TODO check whether this is necessary
  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: groups } = api.endpoints.getEventGroups.useQuery()
  const { data: programs } = api.endpoints.getPrograms.useQuery()
  const { data: intendedFor } = api.endpoints.getIntendedFor.useQuery()
  const { data: diets } = api.endpoints.getDiets.useQuery()
  const { data: administrationUnits } =
    api.endpoints.getAdministrationUnits.useQuery({ pageSize: 2000 })
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const cancelPersist = useClearPersistentForm('event', id)

  if (
    !(
      groups &&
      diets &&
      programs &&
      categories &&
      intendedFor &&
      allQualifications &&
      administrationUnits
    )
  )
    return <Loading>Připravujeme formulář</Loading>

  const handleFormSubmit = async () => {
    const datas = {} as StepShapes
    const errors = {} as ErrorShapes
    const areValid = {} as { [K in StepName]: boolean }
    await Promise.all(
      steps.map(key =>
        methods[key].handleSubmit(
          data => {
            areValid[key] = true
            datas[key] = data as any
          },
          ers => {
            areValid[key] = false
            errors[key] = ers as any
          },
        )(),
      ),
    )

    if (Object.values(areValid).every(a => a)) {
      const data = merge({}, ...Object.values(datas))
      if (data.registration) {
        data.registration.is_event_full = Boolean(
          data.registration.is_event_full,
        )
      }
      if (data.propagation) {
        // TODO make a field for this
        data.propagation.organizers = data.propagation.organizers ?? '.'
        data.propagation.vip_propagation =
          data.propagation.vip_propagation ?? null
      }
      if (data.online) {
        data.location = null
      } else {
        data.online_link = null
      }
      delete data.online
      data.start = joinDateTime(data.startDate, data.startTime)
      await onSubmit(data)
      cancelPersist()
    } else {
      showMessage({
        message: 'Opravte, prosím, chyby ve validaci',
        type: 'error',
        detail: JSON.stringify(pickErrors(merge({}, ...Object.values(errors)))),
      })
    }
  }

  const handleFormReset = () => {
    // formMethods.reset(initialData) // this doesn't reset when initialData is empty, but triggers unnecessary watch
    cancelPersist()
    onCancel()
  }

  const isWeekendEvent =
    getIdBySlug(groups?.results ?? [], 'weekend_event') ===
    methods.category.watch('group')
  const isCamp =
    getIdBySlug(groups?.results ?? [], 'camp') ===
    methods.category.watch('group')
  const isVolunteering = getIdsBySlugs(categories?.results ?? [], [
    'public__volunteering__only_volunteering',
    'public__volunteering__with_experience',
  ]).includes(+methods.basicInfo.watch('category'))
  const mainOrganizerDependencies = {
    intended_for: intendedFor?.results.find(
      c => c.id === +methods.intendedFor.watch('intended_for'),
    ),
    group: groups.results.find(g => g.id === +methods.category.watch('group')),
    category: categories.results.find(
      c => c.id === +methods.basicInfo.watch('category'),
    ),
  }

  return (
    <Steps
      onSubmit={handleFormSubmit}
      onCancel={handleFormReset}
      actions={[
        {
          name: 'Uložit',
          props: {},
        },
      ]}
    >
      <Step name="kategorie akce" hasError={hasFormError(methods.category)}>
        <EventCategoryStep methods={methods.category} />
      </Step>
      <Step name="základní info" hasError={hasFormError(methods.basicInfo)}>
        <BasicInfoStep methods={methods.basicInfo} />
      </Step>
      <Step name="pro koho" hasError={hasFormError(methods.intendedFor)}>
        <IntendedForStep methods={methods.intendedFor} isCamp={isCamp} />
      </Step>
      <Step name="přihlášení" hasError={hasFormError(methods.registration)}>
        <RegistrationStep methods={methods.registration} />
      </Step>
      <Step name="lokalita" hasError={hasFormError(methods.location)}>
        <LocationStep methods={methods.location} />
      </Step>
      <Step
        name="info pro účastníky"
        hasError={hasFormError(methods.propagation)}
      >
        <PropagationStep
          methods={methods.propagation}
          isVolunteering={isVolunteering}
          isWeekendEvent={isWeekendEvent}
          isCamp={isCamp}
        />
      </Step>
      <Step name="pozvánka" hasError={hasFormError(methods.details)}>
        <EventDetailsStep
          isVolunteering={isVolunteering}
          methods={methods.details}
        />
      </Step>
      <Step
        name="organizátorský tým"
        hasError={hasFormError(methods.organizers)}
      >
        <OrganizerStep
          methods={methods.organizers}
          mainOrganizerDependencies={mainOrganizerDependencies}
        />
      </Step>
      <Step name="přihlášky" hidden={!initialData?.id}>
        {initialData?.id && <ParticipantsStep eventId={initialData.id} />}
      </Step>
    </Steps>
  )
}

export default EventForm
