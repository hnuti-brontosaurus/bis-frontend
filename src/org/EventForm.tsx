import { skipToken } from '@reduxjs/toolkit/dist/query'
import { clone, merge, omit } from 'lodash'
import pick from 'lodash/pick'
import { FC, useEffect, useMemo } from 'react'
import { FieldErrorsImpl, useForm, UseFormReturn } from 'react-hook-form'
import { DeepPick } from 'ts-deep-pick'
import type { Assign, Optional, Overwrite } from 'utility-types'
import { api, CorrectLocation, EventPayload } from '../app/services/bis'
import { EventPropagationImage, Question, User } from '../app/services/testApi'
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
  splitDateTime,
} from '../utils/helpers'
import BasicInfoStep from './EventForm/steps/BasicInfoStep'
import EventCategoryStep from './EventForm/steps/EventCategoryStep'
import IntendedForStep from './EventForm/steps/IntendedForStep'
import InvitationStep from './EventForm/steps/InvitationStep'
import LocationStep from './EventForm/steps/LocationStep'
import OrganizerStep from './EventForm/steps/OrganizerStep'
import ParticipantsStep from './EventForm/steps/ParticipantsStep'
import PropagationStep from './EventForm/steps/PropagationStep'
import RegistrationStep from './EventForm/steps/RegistrationStep'

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
    location: NewLocation | Pick<CorrectLocation, 'id'> | null
    main_image: Optional<EventPropagationImage, 'id' | 'order'>
    images: Optional<EventPropagationImage, 'id' | 'order'>[]
  }
>

export type EventFormShape = Assign<
  SubmitShape,
  {
    startDate: string
    startTime: string
    // online is an internal variable
    // it doesn't get sent to API
    // we only keep track of whether to save location or online_link
    online: boolean
    main_organizer: User
    other_organizers: User[]
    propagation: Assign<
      NonNullable<SubmitShape['propagation']>,
      { contact_person: User }
    > | null
    // registrationMethod is internal, doesn't get sent to API
    registrationMethod: 'standard' | 'other' | 'none' | 'full'
    // contactPersonIsMainOrganizer is internal, doesn't get sent to API
    contactPersonIsMainOrganizer: boolean
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
  data?: Partial<SubmitShape>,
): Partial<EventFormShape> => {
  const returnData: Partial<EventFormShape> = merge(
    { number_of_sub_events: 1 },
    omit(clone(data), [
      'main_organizer',
      'other_organizers',
      'propagation.contact_person', // seems like lodash's omit can't properly get type when omitting nested properties
    ]),
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

  returnData.online = data?.online_link ? true : false
  const [startDate, startTime] = splitDateTime(data?.start ?? '')
  returnData.startDate = startDate
  returnData.startTime = startTime

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
    finalData.location = null
  } else {
    finalData.online_link = ''
  }
  finalData.start = joinDateTime(data.startDate, data.startTime)
  return finalData
}

const EventForm: FC<{
  initialData?: Partial<SubmitShape>
  onSubmit: (data: SubmitShape) => Promise<void>
  onCancel: () => void
  eventToEdit: boolean
  id: string
}> = ({ onSubmit, onCancel, initialData, eventToEdit, id }) => {
  const savedData = usePersistentFormData('event', id) as
    | Partial<EventFormShape>
    | undefined

  const initialAndSavedData: Partial<EventFormShape> = useMemo(
    () => merge(initialData2form(initialData), savedData),
    [initialData, savedData],
  )

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

  /**
   * Fetch initial organizers, and update form with them
   */
  const { data: initialMainOrganizer } = api.endpoints.getUser.useQuery(
    initialData?.main_organizer
      ? { id: initialData.main_organizer }
      : skipToken,
  )

  const { data: initialOtherOrganizersData } = api.endpoints.readUsers.useQuery(
    initialData?.other_organizers
      ? { id: initialData.other_organizers }
      : skipToken,
  )

  const { data: initialContactPerson } = api.endpoints.getUser.useQuery(
    initialData?.propagation?.contact_person
      ? { id: initialData.propagation.contact_person }
      : skipToken,
  )

  const initialOtherOrganizers = useMemo(
    () =>
      initialOtherOrganizersData ? initialOtherOrganizersData.results : [],
    [initialOtherOrganizersData],
  )

  // when initial main organizer is fetched, set it in form
  // TODO if useForm was in different form than fetching these, we could provide these as default values
  //   this is just hacking around that issue (that we don't have the data at the time of initializing useForm)
  useEffect(() => {
    // don't overwrite unsaved value
    if (initialMainOrganizer && !savedData)
      methods.organizers.setValue('main_organizer', initialMainOrganizer)
  }, [initialMainOrganizer, methods.organizers, savedData])

  useEffect(() => {
    // don't overwrite unsaved values
    if (!savedData)
      methods.organizers.setValue(
        'other_organizers',
        initialOtherOrganizers.filter(user => Boolean(user)) as User[],
      )
  }, [initialOtherOrganizers, methods.organizers, savedData])

  useEffect(() => {
    // don't overwrite unsaved value
    if (initialContactPerson && !savedData)
      methods.organizers.setValue(
        'propagation.contact_person',
        initialContactPerson,
      )
  }, [initialContactPerson, methods.organizers, savedData])

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
      administrationUnits &&
      // if main organizer id is provided, wait until we download main organizer
      (!initialData?.main_organizer || initialMainOrganizer) &&
      // wait until we download all other_organizers
      initialOtherOrganizers.every(user => Boolean(user))
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
        {initialData?.id && <ParticipantsStep eventId={initialData.id} />}
      </Step>
    </Steps>
  )
}

export default EventForm
