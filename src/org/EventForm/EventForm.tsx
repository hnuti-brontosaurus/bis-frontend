import { api, CorrectLocation, EventPayload } from 'app/services/bis'
import { EventPropagationImage, Question, User } from 'app/services/bisTypes'
import { Loading, NewLocation, Step, Steps } from 'components'
import { useShowMessage } from 'features/systemMessage/useSystemMessage'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from 'hooks/persistForm'
import { merge, mergeWith, omit } from 'lodash'
import pick from 'lodash/pick'
import { FC, useMemo } from 'react'
import { FieldErrorsImpl, useForm, UseFormReturn } from 'react-hook-form'
import { DeepPick } from 'ts-deep-pick'
import type { Assign, Optional, Overwrite } from 'utility-types'
import {
  getIdBySlug,
  hasFormError,
  pickErrors,
  withOverwriteArray,
} from 'utils/helpers'
import BasicInfoStep from './steps/BasicInfoStep'
import EventCategoryStep from './steps/EventCategoryStep'
import IntendedForStep from './steps/IntendedForStep'
import InvitationStep from './steps/InvitationStep'
import LocationStep from './steps/LocationStep'
import OrganizerStep from './steps/OrganizerStep'
import ParticipantsStep from './steps/ParticipantsStep'
import PropagationStep from './steps/PropagationStep'
import RegistrationStep from './steps/RegistrationStep'

const steps = [
  'category',
  'basicInfo',
  'intendedFor',
  'location',
  'registration',
  'propagation',
  'invitation',
  'organizers',
] as const

type StepName = typeof steps[number]

export type SubmitShape = Assign<
  EventPayload,
  {
    questions: Optional<Question, 'id' | 'order'>[]
    location: NewLocation | Pick<CorrectLocation, 'id'>
    main_image: Optional<EventPropagationImage, 'id' | 'order'>
    images: Optional<EventPropagationImage, 'id' | 'order'>[]
  }
>

export type InitialEventData = Overwrite<
  SubmitShape,
  {
    main_organizer: User
    other_organizers: User[]
    propagation: Overwrite<
      NonNullable<SubmitShape['propagation']>,
      { contact_person: User }
    > | null
    location?: CorrectLocation
  }
>

export type EventFormShape = Assign<
  InitialEventData,
  {
    // online is an internal variable
    // it doesn't get sent to API
    // we only keep track of whether to save location or online_link
    online: boolean
    // registrationMethod is internal, doesn't get sent to API
    registrationMethod: 'standard' | 'other' | 'none' | 'full'
    // contactPersonIsMainOrganizer is internal, doesn't get sent to API
    contactPersonIsMainOrganizer: boolean
    location: CorrectLocation | NewLocation
  }
>

const shapes = {
  category: ['group'],
  basicInfo: [
    'name',
    'start',
    'start_time',
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
    'registrationMethod',
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
    'internal_note',
  ],
  invitation: [
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
    'contactPersonIsMainOrganizer',
    'propagation.organizers',
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
  // we have to type location separately because of some error with DeepPick
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

const initialData2form = (
  data?: Partial<InitialEventData>,
): Partial<EventFormShape> => {
  const returnData: Partial<EventFormShape> = merge(
    { number_of_sub_events: 1 },
    data,
  ) as Partial<EventFormShape>

  const registrationMethod = data?.registration?.is_event_full
    ? 'full'
    : data?.registration?.is_registration_required === false
    ? 'none'
    : data?.registration?.is_registration_required === true
    ? 'standard'
    : ''

  if (registrationMethod) {
    returnData.registrationMethod = registrationMethod
  }

  returnData.online = data?.location?.id === 1 ? true : false

  return returnData
}

const form2finalData = (data: EventFormShape): SubmitShape => {
  const finalData: SubmitShape = merge(
    {},
    omit(data, [
      'online',
      'registrationMethod',
      'contactPersonIsMainOrganizer',
    ]),
    {
      // map users to user ids
      main_organizer: data.main_organizer.id,
      other_organizers: data.other_organizers.map(({ id }) => id),
      propagation: merge({}, data.propagation, {
        contact_person: data.contactPersonIsMainOrganizer
          ? data.main_organizer.id
          : data.propagation!.contact_person.id,
      }),
    },
  )

  // when event is full, set it full, and vice-versa
  finalData.registration!.is_event_full = data.registrationMethod === 'full'

  if (data.registrationMethod === 'none') {
    finalData.registration!.is_registration_required = false
  } else if (data.registrationMethod === 'standard') {
    finalData.registration!.is_registration_required = true
  }

  if (data.propagation) {
    finalData.propagation!.vip_propagation =
      data.propagation.vip_propagation ?? null
  }
  if (data.online) {
    finalData.location = { id: 1 }
  } else {
    finalData.online_link = ''
  }

  if (!data.start_time) {
    finalData.start_time = null
  }

  return finalData
}

const EventForm: FC<{
  initialData?: Partial<InitialEventData>
  onSubmit: (data: SubmitShape) => Promise<void>
  onCancel: () => void
  eventToEdit: boolean
  id: string
}> = ({ onSubmit, onCancel, initialData, eventToEdit, id }) => {
  const savedData = usePersistentFormData('event', id) as
    | Partial<EventFormShape>
    | undefined

  const initialAndSavedData: Partial<EventFormShape> = useMemo(
    () =>
      mergeWith(initialData2form(initialData), savedData, withOverwriteArray),
    [initialData, savedData],
  )

  console.log(initialData, savedData, initialAndSavedData)

  const categoryForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.category),
  })
  const basicInfoForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.basicInfo),
  })
  const intendedForForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.intendedFor),
  })
  const locationForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.location),
  })
  const registrationForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.registration),
  })
  const propagationForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.propagation),
  })
  const invitationForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.invitation),
  })
  const organizersForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.organizers),
  })

  const methods: MethodsShapes = useMemo(
    () =>
      ({
        category: categoryForm,
        basicInfo: basicInfoForm,
        intendedFor: intendedForForm,
        location: locationForm,
        registration: registrationForm,
        propagation: propagationForm,
        invitation: invitationForm,
        organizers: organizersForm,
      } as MethodsShapes),
    [
      basicInfoForm,
      categoryForm,
      intendedForForm,
      invitationForm,
      locationForm,
      organizersForm,
      propagationForm,
      registrationForm,
    ],
  )

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
      const data = form2finalData(merge({}, ...Object.values(datas)))
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
    getIdBySlug(groups.results, 'weekend_event') ===
    methods.category.watch('group')
  const isCamp =
    getIdBySlug(groups.results, 'camp') === methods.category.watch('group')
  const isVolunteering =
    getIdBySlug(categories.results, 'public__volunteering') ===
    +methods.basicInfo.watch('category')
  const mainOrganizerDependencies = {
    intended_for: intendedFor.results.find(
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
      <Step name="lokalita" hasError={hasFormError(methods.location)}>
        <LocationStep methods={methods.location} />
      </Step>
      <Step name="přihlášení" hasError={hasFormError(methods.registration)}>
        <RegistrationStep methods={methods.registration} />
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
      <Step name="pozvánka" hasError={hasFormError(methods.invitation)}>
        <InvitationStep
          isVolunteering={isVolunteering}
          methods={methods.invitation}
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
        {initialData?.id && initialData?.name && (
          <ParticipantsStep
            eventId={initialData.id}
            eventName={initialData.name}
            onlyApplications
          />
        )}
      </Step>
    </Steps>
  )
}

export default EventForm
