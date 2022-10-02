import merge from 'lodash/merge'
import { FC, Fragment, useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import Select from 'react-select'
import type { Optional } from 'utility-types'
import { api, EventPayload } from '../app/services/bis'
import {
  AdministrationUnit,
  EventPropagationImage,
  Location,
  Question,
} from '../app/services/testApi'
import FormInputError from '../components/FormInputError'
import SelectUsers, {
  SelectByQuery,
  SelectUser,
} from '../components/SelectUsers'
import { Step, Steps } from '../components/Steps'
import { useAllPages } from '../hooks/allPages'
import {
  file2base64,
  getIdBySlug,
  getIdsBySlugs,
  requireBoolean,
} from '../utils/helpers'

export type FormShape = EventPayload & {
  questions: Optional<Question, 'id' | 'order'>[]
  main_image?: Optional<EventPropagationImage, 'id' | 'order'>
  images: Optional<EventPropagationImage, 'id' | 'order'>[]
}

const EventForm: FC<{
  initialData?: Partial<FormShape>
  onSubmit: (data: FormShape) => void
}> = ({ onSubmit, initialData }) => {
  let i = 0
  const formMethods = useForm<
    EventPayload & {
      questions: Omit<Question, 'id' | 'order'>[]
      main_image?: Omit<EventPropagationImage, 'id' | 'order'>
      images: Omit<EventPropagationImage, 'id' | 'order'>[]
    }
  >({
    defaultValues: merge(
      {},
      {
        finance: null,
        record: null,
        propagation: {
          accommodation: '.',
          organizers: '.',
          working_days: 0,
        },
      },
      initialData,
    ),
  })

  const {
    register,
    unregister,
    handleSubmit,
    getValues,
    setValue,
    watch,
    control,
    formState: { errors },
  } = formMethods

  const questionFields = useFieldArray({
    control,
    name: 'questions',
  })

  const imageFields = useFieldArray({
    control,
    name: 'images',
  })

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

  useEffect(() => {
    // when there is no empty image, add empty image (add button)
    if (!getValues('images') || getValues('images').length === 0)
      imageFields.append({ image: '' })
    // when images change, check that there is always one empty
    const subscription = watch((data, { name, type }) => {
      if (
        data.images &&
        data.images.length ===
          data.images.filter(image => Boolean(image && image.image)).length
      )
        imageFields.append({ image: '' })
    })
    //imageFields.append({ image: '' })

    return () => subscription.unsubscribe()
  }, [watch, imageFields, getValues])

  // unregister stuff
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      if (
        name === 'intended_for' &&
        getIdBySlug(
          intendedFor?.results ?? [],
          'for_first_time_participant',
        ) !== data.intended_for
      ) {
        unregister('propagation.vip_propagation')
        setValue('propagation.vip_propagation', null)
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, intendedFor?.results, unregister, setValue])

  if (
    isEventCategoriesLoading ||
    isEventGroupsLoading ||
    isEventProgramsLoading ||
    isIntendedForLoading ||
    isDietsLoading ||
    isAdministrationUnitsLoading ||
    !isAdministrationUnitsFinished
  )
    return <div>Loading (event stuff)</div>

  const handleFormSubmit = handleSubmit(data => {
    if (data.registration) {
      data.registration.is_event_full = Boolean(data.registration.is_event_full)
    }
    onSubmit(data)
  })

  return (
    <div>
      <FormProvider {...formMethods}>
        <form onSubmit={handleFormSubmit}>
          <Steps>
            <Step name="kategorie akce" fields={['group']}>
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
            <Step
              name="základní info"
              fields={[
                'name',
                'start',
                'end',
                'number_of_sub_events',
                'category',
                'program',
                'administration_units',
              ]}
            >
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
            <Step
              name="pro koho"
              fields={[
                'intended_for',
                'propagation.vip_propagation.goals_of_event',
                'propagation.vip_propagation.program',
                'propagation.vip_propagation.short_invitation_text',
                'propagation.vip_propagation.rover_propagation',
              ]}
            >
              <div>
                {++i}. Pro koho
                <fieldset>
                  <FormInputError>
                    <Controller
                      name="intended_for"
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
                  watch('intended_for') === 5 && (
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
            <Step
              name="přihlášení"
              fields={[
                'is_internal',
                'propagation.is_shown_on_web',
                'registration',
              ]}
            >
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
                    {questionFields.fields.map((item, index) => (
                      <li key={item.id}>
                        <input
                          {...register(`questions.${index}.question` as const)}
                        />
                        <label>
                          <input
                            type="checkbox"
                            {...register(
                              `questions.${index}.is_required` as const,
                            )}
                          />{' '}
                          povinné?
                        </label>
                        <button
                          type="button"
                          onClick={() => questionFields.remove(index)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => questionFields.append({ question: '' })}
                  >
                    append
                  </button>
                </div>
                {/*
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
*/}
              </div>
            </Step>
            <Step name="lokace" fields={['location']}>
              <div>{++i}. Lokace (TODO)</div>
              <FormInputError>
                <Controller
                  name="location"
                  control={control}
                  render={({ field: { ref, ...field } }) => (
                    <SelectByQuery
                      {...field}
                      queryRead={api.endpoints.readLocation}
                      querySearch={api.endpoints.readLocations}
                      transform={(location: Location) => ({
                        label: location.name,
                        value: location.id,
                      })}
                      customRef={ref}
                    />
                  )}
                />
              </FormInputError>
            </Step>
            <Step
              name="info pro účastníky"
              fields={[
                'propagation.cost',
                'propagation.discounted_cost',
                'propagation.minimum_age',
                'propagation.maximum_age',
                'propagation.accommodation',
                'propagation.diets',
                'propagation.working_hours',
                'propagation.working_days',
                'propagation.contact_person',
                'propagation.contact_name',
                'propagation.contact_email',
                'propagation.contact_phone',
                'propagation.web_url',
              ]}
            >
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
                      render={({ field }) => <SelectUser {...field} />}
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
            <Step
              name="detaily akce"
              fields={[
                'internal_note',
                'propagation.invitation_text_introduction',
                'propagation.invitation_text_practical_information',
                'propagation.invitation_text_work_description',
                'propagation.invitation_text_about_us',
                'main_image',
                'images',
              ]}
            >
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
              <Controller
                name="main_image.image"
                control={control}
                render={({ field }) => (
                  <label>
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      {...field}
                      value=""
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        field.onChange(file ? await file2base64(file) : '')
                      }}
                    />
                    {watch('main_image.image') ? (
                      <img src={watch('main_image.image')} alt="" />
                    ) : (
                      <span>+</span>
                    )}
                  </label>
                )}
              />
              <div>Fotky k malé ochutnávce</div>
              <ul>
                {imageFields.fields.map((item, index, allItems) => (
                  <li key={item.id}>
                    <Controller
                      name={`images.${index}.image` as const}
                      control={control}
                      render={({ field }) => (
                        <label>
                          <input
                            style={{ display: 'none' }}
                            type="file"
                            {...field}
                            value=""
                            onChange={async e => {
                              const file = e.target.files?.[0]
                              field.onChange(
                                file ? await file2base64(file) : '',
                              )
                            }}
                          />
                          {watch(`images.${index}.image`) ? (
                            <img src={watch(`images.${index}.image`)} alt="" />
                          ) : (
                            <span>+</span>
                          )}
                        </label>
                      )}
                    />
                    {getValues(`images.${index}.image`) && (
                      <button
                        type="button"
                        onClick={() => imageFields.remove(index)}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Step>
            <Step name="organizátor">
              <div>
                <div>
                  <header>{++i} Hlavní organizátor/ka</header>
                  <FormInputError>
                    <Controller
                      name="main_organizer"
                      control={control}
                      render={({ field }) => <SelectUser {...field} />}
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
                      render={({ field }) => <SelectUsers {...field} />}
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

export default EventForm
