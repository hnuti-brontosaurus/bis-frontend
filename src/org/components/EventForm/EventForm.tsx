import { api } from 'app/services/bis'
import type { EventPayload, Location } from 'app/services/bisTypes'
import {
  EventPropagationImagePayload,
  Question,
  User,
} from 'app/services/bisTypes'
import { Loading, NewLocation, Step, Steps } from 'components'
import * as translations from 'config/static/combinedTranslations'
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
import { getIdBySlug, hasFormError, withOverwriteArray } from 'utils/helpers'
import { validationErrors2Message } from 'utils/validationErrors'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { EventGroupStep } from './steps/EventGroupStep'
import { IntendedForStep } from './steps/IntendedForStep'
import { InvitationStep } from './steps/InvitationStep'
import { LocationStep } from './steps/LocationStep'
import { OrganizerStep } from './steps/OrganizerStep'
import { ParticipantsStep } from './steps/ParticipantsStep'
import { PropagationStep } from './steps/PropagationStep'
import { RegistrationStep } from './steps/RegistrationStep'

const steps = [
  'group',
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
    location: NewLocation | Pick<Location, 'id'>
    main_image: EventPropagationImagePayload
    images: EventPropagationImagePayload[]
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
    location?: Location
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
    location: Location | NewLocation
  }
>

const shapes = {
  group: ['group'],
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
    : data?.registration?.alternative_registration_link
    ? 'other'
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

  finalData.registration = finalData.registration ?? {
    questionnaire: null,
    is_event_full: false,
    alternative_registration_link: '',
    is_registration_required: true,
  }

  if (finalData.registration) {
    // well we know finalData.registration is set already, we just did it
    switch (data.registrationMethod) {
      case 'none':
        finalData.registration.is_registration_required = false
        finalData.registration.is_event_full = false
        finalData.registration.alternative_registration_link = ''
        finalData.registration.questionnaire = null
        break
      case 'standard':
        finalData.registration.is_registration_required = true
        finalData.registration.is_event_full = false
        finalData.registration.alternative_registration_link = ''
        // keep questionnaire set
        break
      case 'other':
        finalData.registration.is_registration_required = true
        finalData.registration.is_event_full = false
        // keep alternative registration link set
        finalData.registration.questionnaire = null
        break
      case 'full':
        finalData.registration.is_event_full = true
        // everything else should equal initial data
        // we need to take care of that in UpdateEvent
        // or whatever component updates the data
        break
      default:
        break
    }
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

export const EventForm: FC<{
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

  const groupForm = useForm({
    defaultValues: pick(initialAndSavedData, shapes.group),
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
        group: groupForm,
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
      groupForm,
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
  const { data: categories } = api.endpoints.readEventCategories.useQuery()
  const { data: groups } = api.endpoints.readEventGroups.useQuery()
  const { data: programs } = api.endpoints.readPrograms.useQuery()
  const { data: intendedFor } = api.endpoints.readIntendedFor.useQuery()
  const { data: diets } = api.endpoints.readDiets.useQuery()
  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })
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
      try {
        await onSubmit(data)
        cancelPersist()
      } catch (error) {
        // we catch the remaining error just to satisfy tests
        // otherwise we could do without this try catch
        // it's not causing troubles
      }
    } else {
      showMessage({
        message: 'Opravte, prosím, chyby ve validaci',
        type: 'error',
        detail: validationErrors2Message(
          merge({}, ...Object.values(errors)),
          translations.event,
          translations.generic,
        ),
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
    methods.group.watch('group')
  const isCamp =
    getIdBySlug(groups.results, 'camp') === methods.group.watch('group')
  const isVolunteering =
    getIdBySlug(categories.results, 'public__volunteering') ===
    +methods.basicInfo.watch('category')
  const mainOrganizerDependencies = {
    intended_for: intendedFor.results.find(
      c => c.id === +methods.intendedFor.watch('intended_for'),
    ),
    group: groups.results.find(g => g.id === +methods.group.watch('group')),
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
      <Step name="druh akce" hasError={hasFormError(methods.group)}>
        <EventGroupStep methods={methods.group} />
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
