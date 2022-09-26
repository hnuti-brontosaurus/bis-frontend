import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Fragment, useState } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import Select from 'react-select'
import { api, EventPayload } from './app/services/bis'
import {
  AdministrationUnit,
  Question,
  Questionnaire,
  Registration,
} from './app/services/testApi'
import FormInputError from './components/FormInputError'
import { Step, Steps } from './components/Steps'
import { useAllPages } from './hooks/allPages'
import { getIdBySlug, getIdsBySlugs, requireBoolean } from './utils/helpers'

type FormEventQuestionnaire = Questionnaire & {
  questions: Omit<Question, 'id' | 'order'>[]
}

type FormEventRegistration = Omit<Registration, 'questionnaire'> & {
  questionnaire: FormEventQuestionnaire | null
}

const CreateEvent = () => {
  let i = 0
  const formMethods = useForm<
    Omit<EventPayload, 'registration'> & {
      registration: FormEventRegistration | null
    }
  >(
    {
      //defaultValues: { number_of_sub_events: 1 } } /*{
      defaultValues: {
        name: 'asdf' + Date.now(),
        is_canceled: false,
        start: '2022-10-10T15:03',
        end: '2029-10-18',
        number_of_sub_events: 1,
        location: 50,
        online_link: '',
        group: 3,
        category: 8,
        program: 2,
        administration_units: [6],
        main_organizer: 2,
        other_organizers: [25, 47, 59],
        is_attendance_list_required: false,
        is_internal: false,
        internal_note: 'asdf',
        duration: 3,
        //propagation: null,
        propagation: {
          is_shown_on_web: false,
          minimum_age: 15,
          maximum_age: 30,
          cost: 250,
          discounted_cost: null,
          intended_for: 1,
          accommodation: '.',
          diets: [2, 3],
          organizers: 'string',
          web_url: 'https://example.com',
          invitation_text_introduction: 'asdf',
          invitation_text_practical_information: 'asdf',
          invitation_text_work_description: 'aaaa',
          invitation_text_about_us: 'aaaaaa',
          contact_person: 5,
          contact_name: 'Name Contact',
          contact_phone: '+420 771 111 111',
          contact_email: 'test@example.com',
          vip_propagation: null,
          working_hours: 0,
          working_days: 0,
        },
        registration: {
          is_registration_required: true,
        },
        record: null,
        finance: null,
      },
    }, // */,
  )

  const {
    register,
    unregister,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors },
  } = formMethods

  const questions = useFieldArray({
    control,
    name: 'registration.questionnaire.questions',
  })

  const [createEvent, { isLoading }] = api.endpoints.createEvent.useMutation()
  const [createQuestion, { isLoading: isSavingQuestions }] =
    api.endpoints.createQuestion.useMutation()

  const [orgQuery, setOrgQuery] = useState('')

  const { data: categories, isLoading: isEventCategoriesLoading } =
    api.endpoints.getEventCategories.useQuery()
  const { data: groups, isLoading: isEventGroupsLoading } =
    api.endpoints.getEventGroups.useQuery()
  const { data: programs, isLoading: isEventProgramsLoading } =
    api.endpoints.getPrograms.useQuery()
  const { data: intendedFor, isLoading: isIntendedForLoading } =
    api.endpoints.getIntendedFor.useQuery()
  const { data: diets, isLoading: isDietsLoading } =
    api.endpoints.getDiets.useQuery()
  const [
    administrationUnits,
    { isLoading: isAdministrationUnitsLoading },
    isAdministrationUnitsFinished,
  ] = useAllPages(api.endpoints.getAdministrationUnits)
  const { data: potentialOrganizers, isLoading: isPotentialOrganizersLoading } =
    api.endpoints.searchOrganizers.useQuery({
      query: orgQuery,
    })

  const contactPersonId = getValues('propagation.contact_person')
  const mainOrganizerId = getValues('main_organizer')
  const otherOrganizersIds = getValues('other_organizers')

  const { data: contactPerson, isLoading: isContactPersonLoading } =
    api.endpoints.getUser.useQuery(
      contactPersonId ? { id: contactPersonId } : skipToken,
    )

  const { data: mainOrganizer, isLoading: isMainOrganizerLoading } =
    api.endpoints.getUser.useQuery(
      mainOrganizerId ? { id: mainOrganizerId } : skipToken,
    )

  const { data: otherOrganizers, isLoading: isOtherOrganizersLoading } =
    api.endpoints.readUsers.useQuery(
      otherOrganizersIds && otherOrganizersIds.length > 0
        ? { id: otherOrganizersIds }
        : skipToken,
    )

  if (
    isLoading ||
    isEventCategoriesLoading ||
    isEventGroupsLoading ||
    isEventProgramsLoading ||
    isIntendedForLoading ||
    isDietsLoading ||
    isPotentialOrganizersLoading ||
    isContactPersonLoading ||
    isMainOrganizerLoading ||
    isOtherOrganizersLoading ||
    isAdministrationUnitsLoading ||
    !isAdministrationUnitsFinished ||
    isSavingQuestions
  )
    return <div>Loading (event stuff)</div>

  console.log(errors)

  const handleFormSubmit = handleSubmit(async data => {
    console.log(data)
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
    const event = await createEvent(data).unwrap()
    if (data.registration?.questionnaire?.questions) {
      await Promise.all(
        data.registration.questionnaire.questions.map((question, order) =>
          createQuestion({
            eventId: event.id,
            question: { ...question, order },
          }).unwrap(),
        ),
      )
    }
    // TODO save questions
  })

  return (
    <div>
      <FormProvider {...formMethods}>
        <form onSubmit={handleFormSubmit}>
          <Steps>
            <Step name="kategorie akce">
              {/* kategorie akce */}
              <fieldset>
                {++i}. Jaký je typ nové akce?
                <FormInputError>
                  <Controller
                    name="group"
                    control={control}
                    rules={{
                      required: 'Toto pole je povinné!',
                    }}
                    render={({ field }) => (
                      <>
                        {groups &&
                          groups.results!.map(({ id, name, slug }) => (
                            <Fragment key={id}>
                              <input
                                ref={field.ref}
                                key={id}
                                type="radio"
                                name={field.name}
                                id={slug}
                                value={id}
                                checked={id === field.value}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                              <label htmlFor={slug}>{name}</label>
                            </Fragment>
                          ))}
                      </>
                    )}
                  />
                </FormInputError>
              </fieldset>
            </Step>
            <Step name="základní info">
              <div>
                {++i}. Název
                <FormInputError>
                  <input
                    type="text"
                    {...register('name', { required: 'Toto pole je povinné' })}
                  />
                </FormInputError>
              </div>
              <div>
                {++i}. Kdy bude akce?{' '}
                <label htmlFor="start">
                  Od{' '}
                  <FormInputError>
                    <input
                      type="datetime-local"
                      id="start"
                      {...register('start', { required: 'required' })}
                    />
                  </FormInputError>
                </label>
                <label htmlFor="end">
                  Do{' '}
                  <FormInputError>
                    <input
                      type="date"
                      id="end"
                      {...register('end', { required: 'required' })}
                    />
                  </FormInputError>
                </label>
              </div>
              <div>
                {++i}. Počet akcí v uvedeném období (TODO add help)
                <FormInputError>
                  <input
                    type="number"
                    {...register('number_of_sub_events', {
                      required: 'required',
                      valueAsNumber: true,
                    })}
                  />
                </FormInputError>
              </div>
              <div>
                {++i}. Typ akce
                <FormInputError>
                  <select
                    {...register('category', { required: 'required' })}
                    defaultValue=""
                  >
                    <option disabled value="" />
                    {categories &&
                      categories.results!.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </FormInputError>
              </div>
              <div>
                {++i}. Program
                <FormInputError>
                  <select
                    {...register('program', { required: 'required' })}
                    defaultValue=""
                  >
                    <option disabled value="" />
                    {programs &&
                      programs.results!.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                  </select>
                </FormInputError>
              </div>
              <div>
                {++i}. Pořádající ZČ/Klub/RC/ústředí
                <FormInputError>
                  <Controller
                    name="administration_units"
                    rules={{ required: 'required' }}
                    control={control}
                    render={({ field: { onChange, value, name, ref } }) => (
                      <Select
                        isMulti
                        options={
                          administrationUnits
                            ? administrationUnits.map(unit => ({
                                label: `${unit.category.name} ${unit.name}`,
                                value: unit.id,
                              }))
                            : []
                        }
                        onChange={val => onChange(val.map(val => val.value))}
                        defaultValue={(
                          (getValues('administration_units') ?? [])
                            .map(id =>
                              administrationUnits.find(unit => id === unit.id),
                            )
                            .filter(a => !!a) as AdministrationUnit[]
                        ).map(unit => ({
                          label: `${unit.category.name} ${unit.name}`,
                          value: unit.id,
                        }))}
                      />
                    )}
                  />
                </FormInputError>
              </div>
            </Step>
            <Step name="pro koho">
              <div>
                {++i}. Pro koho
                <fieldset>
                  <FormInputError>
                    <Controller
                      name="propagation.intended_for"
                      control={control}
                      rules={{
                        required: 'Toto pole je povinné!',
                      }}
                      render={({ field }) => (
                        <>
                          {intendedFor &&
                            intendedFor.results!.map(({ id, name, slug }) => (
                              <Fragment key={id}>
                                <input
                                  ref={field.ref}
                                  key={id}
                                  type="radio"
                                  name={field.name}
                                  id={slug}
                                  value={id}
                                  checked={id === field.value}
                                  onChange={e =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                                <label htmlFor={slug}>{name}</label>
                              </Fragment>
                            ))}
                        </>
                      )}
                    />
                  </FormInputError>
                </fieldset>
                {
                  /* not great hardcoded id */
                  watch('propagation.intended_for') === 5 && (
                    <div>
                      <div>text info pro prvoucastniky</div>
                      <div>Cíle akce a přínos pro prvoúčastníky:</div>
                      <div>
                        Jaké je hlavní téma vaší akce? Jaké jsou hlavní cíle
                        akce? Co nejvýstižněji popište, co akce přináší
                        účastníkům, co zajímavého si zkusí, co se dozví, naučí,
                        v čem se rozvinou…
                      </div>
                      <FormInputError>
                        <textarea
                          {...register(
                            'propagation.vip_propagation.goals_of_event',
                          )}
                        ></textarea>
                      </FormInputError>
                      <div>Programové pojetí akce pro prvoúčastníky:</div>
                      <div>
                        V základu uveďte, jak bude vaše akce programově a
                        dramaturgicky koncipována (motivační příběh, zaměření
                        programu – hry, diskuse, řemesla,...). Uveďte, jak náplň
                        a program akce reflektují potřeby vaší cílové skupiny
                        prvoúčastníků.
                      </div>
                      <FormInputError>
                        <textarea
                          {...register('propagation.vip_propagation.program')}
                        ></textarea>
                      </FormInputError>
                      <div>Krátký zvací text do propagace</div>
                      <div>
                        Text (max 200 znaků) -. Ve 2-4 větách nalákejte na vaši
                        akci a zdůrazněte osobní přínos pro účastníky (max. 200
                        znaků).
                      </div>
                      <FormInputError>
                        <textarea
                          {...register(
                            'propagation.vip_propagation.short_invitation_text',
                          )}
                        ></textarea>
                      </FormInputError>

                      {
                        /*
                        only "camp" can see this
                        https://docs.google.com/document/d/1p3nz0-kVJxwN_pRCYYyhy0BObyGox6LDk35RQPADT4g/edit?disco=AAAAc3SBnZQ
                        */
                        watch('group') === 1 && (
                          <>
                            <div>Propagovat akci v Roverském kmeni</div>
                            <FormInputError>
                              <Controller
                                name="propagation.vip_propagation.rover_propagation"
                                control={control}
                                rules={{ ...requireBoolean }}
                                render={({ field }) => (
                                  <>
                                    {[
                                      { name: 'ano', value: true },
                                      { name: 'ne', value: false },
                                    ].map(({ name, value }) => (
                                      <Fragment key={name}>
                                        <input
                                          ref={field.ref}
                                          type="radio"
                                          name={field.name}
                                          id={name}
                                          value={String(value)}
                                          checked={field.value === value}
                                          onChange={e =>
                                            field.onChange(
                                              e.target.value === 'true'
                                                ? true
                                                : e.target.value === 'false'
                                                ? false
                                                : undefined,
                                            )
                                          }
                                        />
                                        <label htmlFor={name}>{name}</label>
                                      </Fragment>
                                    ))}
                                  </>
                                )}
                              />
                            </FormInputError>
                          </>
                        )
                      }
                    </div>
                  )
                }
              </div>
            </Step>
            <Step name="random (TODO)">
              <div>
                <div>
                  <header>
                    Na koho je akce zaměřená (Help?: Akce zaměřená na členy jsou
                    interní akce HB - valné hromady, týmovky atd.)
                  </header>
                  <FormInputError>
                    <Controller
                      name={'is_internal'}
                      control={control}
                      rules={{
                        ...requireBoolean,
                      }}
                      render={({ field }) => (
                        <>
                          {[
                            { name: 'Na členy', value: true },
                            { name: 'Na nečleny', value: false },
                          ].map(({ name, value }) => (
                            <Fragment key={name}>
                              <input
                                ref={field.ref}
                                type="radio"
                                name={field.name}
                                id={name}
                                value={String(value)}
                                checked={field.value === value}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value === 'true'
                                      ? true
                                      : e.target.value === 'false'
                                      ? false
                                      : undefined,
                                  )
                                }
                              />
                              <label htmlFor={name}>{name}</label>
                            </Fragment>
                          ))}
                        </>
                      )}
                    />
                  </FormInputError>
                </div>
                <div>
                  <header>
                    Zveřejnit na brontosauřím webu * (help?: Pokud zaškrtnete
                    ano, akce se zobrazí na webu www. brontosaurus.cz. Volbu ne
                    zaškrtněte pouze jedná-li se o interní akci HB nebo interní
                    akci Brďa.)
                  </header>
                  <FormInputError>
                    <Controller
                      name={'propagation.is_shown_on_web'}
                      control={control}
                      rules={{ ...requireBoolean }}
                      render={({ field }) => (
                        <>
                          {[
                            { name: 'Ano', value: true },
                            { name: 'Ne', value: false },
                          ].map(({ name, value }) => (
                            <Fragment key={name}>
                              <input
                                ref={field.ref}
                                type="radio"
                                name={field.name}
                                id={name}
                                value={String(value)}
                                checked={field.value === value}
                                onChange={e =>
                                  field.onChange(
                                    e.target.value === 'true'
                                      ? true
                                      : e.target.value === 'false'
                                      ? false
                                      : undefined,
                                  )
                                }
                              />
                              <label htmlFor={name}>{name}</label>
                            </Fragment>
                          ))}
                        </>
                      )}
                    />
                  </FormInputError>
                </div>
                <div>
                  <header>
                    Způsob přihlášení *! (help?: Způsoby přihlášení na vaši akci
                    na www.brontosaurus.cz, které se zobrazí po kliknutí na
                    tlačítko “chci jet”:
                  </header>
                </div>
                <pre>
                  {`standardní přihláška na brontowebu (doporučujeme!) -  Je jednotná pro celé HB. Do této přihlášky si můžete přidat 4 vlastní otázky. Vyplněné údaje se pak rovnou zobrazí v BIS, což tobě i kanceláři ulehčí práci.
jiná elektornická přihláška -  Přesměruje zájemce na vaši přihlášku. 
přihlášení na e-mail organizátora - Přesměruje zájemce na outlook s kontaktním emailem.
Registrace není potřeba, stačí přijít - Zobrazí se jako text u vaší akce.
Máme bohužel plno, zkuste jinou z našich akcí - Zobrazí se jako text u vaší akce.)`}
                </pre>
                <div>
                  Je požadována registrace?
                  <FormInputError>
                    <Controller
                      name={'registration.is_registration_required'}
                      control={control}
                      rules={{
                        ...requireBoolean,
                      }}
                      render={({ field }) => (
                        <>
                          {[
                            { name: 'Ano', value: true },
                            { name: 'Ne', value: false },
                          ].map(({ name, value }) => (
                            <Fragment key={name}>
                              <input
                                ref={field.ref}
                                type="radio"
                                name={field.name}
                                id={name}
                                value={String(value)}
                                checked={field.value === value}
                                onChange={e => {
                                  field.onChange(
                                    e.target.value === 'true'
                                      ? true
                                      : e.target.value === 'false'
                                      ? false
                                      : undefined,
                                  )
                                }}
                              />
                              <label htmlFor={name}>{name}</label>
                            </Fragment>
                          ))}
                        </>
                      )}
                    />
                  </FormInputError>
                </div>
                <div>
                  Je akce plná?
                  <FormInputError>
                    <input
                      type="checkbox"
                      {...register('registration.is_event_full')}
                    />
                  </FormInputError>
                </div>

                <div>
                  <header>Přihláška</header>
                  <FormInputError>
                    <textarea
                      placeholder="úvod"
                      {...register('registration.questionnaire.introduction')}
                    />
                  </FormInputError>
                  <FormInputError>
                    <textarea
                      placeholder="text po odeslání"
                      {...register(
                        'registration.questionnaire.after_submit_text',
                      )}
                    />
                  </FormInputError>
                  <header>Otázky</header>
                  <ul>
                    {questions.fields.map((item, index) => (
                      <li key={item.id}>
                        <input
                          {...register(
                            `registration.questionnaire.questions.${index}.question` as const,
                          )}
                        />
                        <label>
                          <input
                            type="checkbox"
                            {...register(
                              `registration.questionnaire.questions.${index}.is_required` as const,
                            )}
                          />{' '}
                          povinné?
                        </label>
                        <button
                          type="button"
                          onClick={() => questions.remove(index)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => questions.append({ question: '' })}
                  >
                    append
                  </button>
                </div>
                <pre>
                  {`
Způsob přihlášení *! (help?: Způsoby přihlášení na vaši akci na www.brontosaurus.cz, které se zobrazí po kliknutí na tlačítko “chci jet”:
standardní přihláška na brontowebu (doporučujeme!) -  Je jednotná pro celé HB. Do této přihlášky si můžete přidat 4 vlastní otázky. Vyplněné údaje se pak rovnou zobrazí v BIS, což tobě i kanceláři ulehčí práci.
jiná elektornická přihláška -  Přesměruje zájemce na vaši přihlášku. 
přihlášení na e-mail organizátora - Přesměruje zájemce na outlook s kontaktním emailem.
Registrace není potřeba, stačí přijít - Zobrazí se jako text u vaší akce.
Máme bohužel plno, zkuste jinou z našich akcí - Zobrazí se jako text u vaší akce.)

Standardní přihláška na brontowebu
Fce: tlačítko chci jet odkáže na: vyplnit předdefinovaný brontosauří formulář
Jiná elektronická přihláška
Fce: tlačítko chci jet = proklik na jinou elektronickou přihlášku
přihlášení  na mail organizátora
Fce: tlačítko chci jet = otevření outlook, kde je příjemce mail organizátora
Registrace není potřeba, stačí přijít
FCE: propíše se na web, že není třeba se hlásit
Máme bohužel plno, zkuste jinou z našich akcí
Fce: propíše se to na web

při vybrání možnosti “Standardní příhláška na brontowebu” se objeví tyto položky 
(help? - Zde můžeš připsat svoje doplňující otázky pro účastníky, které se zobrazí u standartní přihlášky na brontowebu)
Otázka 1
Otázka 2
Otázka 3
Otázka 4

při vybrání možnosti “jiná elektronická přihláška” se zobrazí políčko
URL tvé přihlášky
Fce: proklik na přihlášky vytvořenou externě`}
                </pre>
              </div>
            </Step>
            <Step name="lokace">
              <div>{++i}. Lokace (TODO)</div>
            </Step>
            <Step name="info pro účastníky">
              <div>
                <div>{++i}. Účastnický poplatek</div>
                částka{' '}
                <FormInputError>
                  <input
                    type="number"
                    {...register('propagation.cost', { required: 'required' })}
                  />
                </FormInputError>
                snížený poplatek{' '}
                <FormInputError>
                  <input
                    type="number"
                    {...register('propagation.discounted_cost')}
                  />
                </FormInputError>
                <div>
                  <header>{++i}. Věk</header>
                  Od{' '}
                  <FormInputError>
                    <input
                      type="number"
                      {...register('propagation.minimum_age', {
                        required: 'required',
                        valueAsNumber: true,
                      })}
                    />
                  </FormInputError>
                  Do{' '}
                  <FormInputError>
                    <input
                      type="number"
                      {...register('propagation.maximum_age', {
                        required: 'required',
                        valueAsNumber: true,
                        validate: maxAge =>
                          Number(getValues('propagation.minimum_age')) <=
                            Number(maxAge) ||
                          'Maximální věk musí být vyšší než minimální věk',
                      })}
                    />
                  </FormInputError>
                </div>
                {getIdsBySlugs(groups?.results ?? [], [
                  'camp',
                  'weekend_event',
                ]).includes(watch('group')) && ( // only camp and weekend
                  <div>
                    <header>{++i} Ubytování</header>
                    <textarea
                      {...register('propagation.accommodation', {
                        required: 'required',
                      })}
                    />
                  </div>
                )}
                {getIdsBySlugs(groups?.results ?? [], [
                  'camp',
                  'weekend_event',
                ]).includes(watch('group')) && ( // only camp and weekend
                  <div>
                    <header>{++i} Strava</header>
                    <FormInputError>
                      <Controller
                        name="propagation.diets"
                        control={control}
                        rules={{
                          required: 'Toto pole je povinné!',
                        }}
                        render={({ field }) => (
                          <>
                            {diets &&
                              diets.results!.map(({ id, name, slug }) => (
                                <Fragment key={id}>
                                  <input
                                    ref={field.ref}
                                    key={id}
                                    type="checkbox"
                                    name={field.name}
                                    id={slug}
                                    value={id}
                                    checked={
                                      field.value && field.value.includes(id)
                                    }
                                    onChange={e => {
                                      // check when unchecked and vise-versa
                                      const targetId = Number(e.target.value)
                                      const set = new Set(field.value)
                                      if (set.has(targetId)) {
                                        set.delete(targetId)
                                      } else {
                                        set.add(targetId)
                                      }
                                      field.onChange(Array.from(set))
                                    }}
                                  />
                                  <label htmlFor={slug}>{name}</label>
                                </Fragment>
                              ))}
                          </>
                        )}
                      />
                    </FormInputError>
                  </div>
                )}
                <div>
                  {++i} Denní pracovní doba
                  <FormInputError>
                    <input
                      type="number"
                      {...register('propagation.working_hours', {
                        required: 'required',
                      })}
                    />
                  </FormInputError>
                  {getIdBySlug(groups?.results ?? [], 'camp') ===
                    watch('group') && (
                    <>
                      Počet pracovních dní na akci
                      <FormInputError>
                        <input
                          type="number"
                          {...register('propagation.working_days', {
                            required: 'required',
                          })}
                        />
                      </FormInputError>
                    </>
                  )}
                </div>
                <div>
                  {++i} Kontaktní osoba
                  <label>
                    <input type="checkbox" /> stejná jako hlavní organizátor
                  </label>
                  {/* TODO if checkbox is checked, autofill, or figure out what happens */}
                  <FormInputError>
                    <Controller
                      name="propagation.contact_person"
                      control={control}
                      render={({ field: { onChange, value, name, ref } }) => (
                        <Select
                          isClearable
                          options={
                            potentialOrganizers
                              ? potentialOrganizers?.results?.map(
                                  ({ display_name, id }) => ({
                                    value: id,
                                    label: display_name,
                                  }),
                                )
                              : []
                          }
                          inputValue={orgQuery}
                          onInputChange={input => setOrgQuery(input)}
                          filterOption={() => true}
                          onChange={val => onChange(val?.value ?? undefined)}
                          {...(contactPerson
                            ? {
                                defaultValue: {
                                  value: contactPerson.id,
                                  label: contactPerson.display_name,
                                },
                              }
                            : {})}
                        />
                      )}
                    />
                  </FormInputError>
                </div>
                {/*
                TODO figure out what happens with name when contact person is filled
                maybe fill when not already filled
                */}
                <div>
                  Jméno kontaktní osoby
                  <FormInputError>
                    <input
                      type="text"
                      {...register('propagation.contact_name', {
                        required: 'required',
                      })}
                    />
                  </FormInputError>
                </div>
                <div>
                  Kontaktní email
                  <FormInputError>
                    <input
                      type="email"
                      {...register('propagation.contact_email', {
                        required: 'required',
                      })}
                    />
                  </FormInputError>
                </div>
                <div>
                  Kontaktní telefon
                  <FormInputError>
                    <input
                      type="tel"
                      {...register('propagation.contact_phone', {})}
                    />
                  </FormInputError>
                </div>
                <div>
                  Web o akci
                  <FormInputError>
                    <input
                      type="url"
                      {...register('propagation.web_url', {})}
                    />
                  </FormInputError>
                </div>
              </div>
            </Step>
            <Step name="detaily akce">
              <div>
                Poznámka (TODO add help)
                <FormInputError>
                  <input type="text" {...register('internal_note', {})} />
                </FormInputError>
              </div>
              <div>
                Zvací text: Co nás čeká
                <FormInputError>
                  <textarea
                    {...register('propagation.invitation_text_introduction', {
                      required: 'required',
                    })}
                  />
                </FormInputError>
              </div>
              <div>
                Zvací text: Co, kde a jak
                <FormInputError>
                  <textarea
                    {...register(
                      'propagation.invitation_text_practical_information',
                      {
                        required: 'required',
                      },
                    )}
                  />
                </FormInputError>
              </div>
              <div>
                Zvací text: Dobrovolnická pomoc
                <FormInputError>
                  <textarea
                    {...register(
                      'propagation.invitation_text_work_description',
                      {
                        required:
                          getIdsBySlugs(categories?.results ?? [], [
                            'public__volunteering__only_volunteering',
                            'public__volunteering__with_experience',
                          ]).includes(+watch('category')) &&
                          'Toto pole je povinné!',
                      },
                    )}
                  />
                </FormInputError>
              </div>
              <div>
                Zvací text: Malá ochutnávka
                <FormInputError>
                  <textarea
                    {...register('propagation.invitation_text_about_us', {})}
                  />
                </FormInputError>
              </div>
              <div>Hlavní foto</div>
              <input type="file" />
              <div>Fotky k malé ochutnávce</div>
              <input type="file" />
            </Step>
            <Step name="organizátor">
              <div>
                <div>
                  <header>{++i} Hlavní organizátor/ka</header>
                  <FormInputError>
                    <Controller
                      name="main_organizer"
                      control={control}
                      rules={{ required: 'Toto pole je povinné!' }}
                      render={({ field: { onChange, value, name, ref } }) => (
                        <Select
                          isClearable
                          options={
                            potentialOrganizers
                              ? potentialOrganizers?.results?.map(
                                  ({ display_name, id }) => ({
                                    value: id,
                                    label: display_name,
                                  }),
                                )
                              : []
                          }
                          inputValue={orgQuery}
                          onInputChange={input => setOrgQuery(input)}
                          filterOption={() => true}
                          onChange={val => onChange(val?.value ?? undefined)}
                          {...(mainOrganizer
                            ? {
                                defaultValue: {
                                  value: mainOrganizer.id,
                                  label: mainOrganizer.display_name,
                                },
                              }
                            : {})}
                        />
                      )}
                    />
                  </FormInputError>
                </div>
                <div>
                  <header>{++i} Organizátorský tým</header>
                  {/* TODO make sure that event creator adds themself here or as main organizer, so they can edit the event */}
                  <FormInputError>
                    <Controller
                      name="other_organizers"
                      control={control}
                      render={({ field: { onChange, value, name, ref } }) => (
                        <Select
                          isMulti
                          options={
                            potentialOrganizers
                              ? potentialOrganizers?.results?.map(
                                  ({ display_name, id }) => ({
                                    value: id,
                                    label: display_name,
                                  }),
                                )
                              : []
                          }
                          inputValue={orgQuery}
                          onInputChange={input => setOrgQuery(input)}
                          filterOption={() => true}
                          onChange={val => onChange(val.map(val => val.value))}
                          defaultValue={
                            otherOrganizers?.results
                              ? otherOrganizers.results!.map(org => ({
                                  label: org.display_name,
                                  value: org.id,
                                }))
                              : []
                          }
                        />
                      )}
                    />
                  </FormInputError>
                </div>
              </div>
              <input type="submit" value="Submit" />
            </Step>
          </Steps>
        </form>
      </FormProvider>
    </div>
  )
}

export default CreateEvent
