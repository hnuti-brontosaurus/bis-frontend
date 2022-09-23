import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Fragment, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { api, EventPayload } from './app/services/bis'
import { Step, Steps } from './components/Steps'

const CreateEvent = () => {
  let i = 0
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm<EventPayload>({
    defaultValues: {
      name: 'Test test test test',
      is_canceled: false,
      start: '2029-10-16T19:36:00+02:00',
      end: '2029-10-18',
      number_of_sub_events: 1,
      location: 50,
      online_link: '',
      group: 3,
      category: 5,
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
        invitation_text_work_description: '',
        invitation_text_about_us: 'aaaaaa',
        contact_person: null,
        contact_name: 'Name Contact',
        contact_phone: '+420 771 111 111',
        contact_email: 'test@example.com',
        vip_propagation: null,
      },
      registration: null,
      record: null,
      finance: null,
    },
  })

  const [createEvent, { isLoading }] = api.endpoints.createEvent.useMutation()

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
  const { data: potentialOrganizers, isLoading: isPotentialOrganizersLoading } =
    api.endpoints.searchOrganizers.useQuery({
      query: orgQuery,
    })

  const mainOrganizerId = getValues('main_organizer')

  const otherOrganizersIds = getValues('other_organizers')

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
    isMainOrganizerLoading ||
    isOtherOrganizersLoading
  )
    return <div>Loading (event stuff)</div>

  const handleFormSubmit = handleSubmit(async data => {
    console.log(data)
    await createEvent(data).unwrap()
  })
  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <Steps>
          <Step name="kategorie akce">
            {/* kategorie akce */}
            <fieldset>
              {++i}. Jaký je typ nové akce?
              <Controller
                name="group"
                control={control}
                rules={
                  {
                    /*required: 'Toto pole je povinné!'*/
                  }
                }
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
            </fieldset>
          </Step>
          <Step name="základní info">
            <div>
              {++i}. Název
              <input
                type="text"
                {...register('name', { required: 'Toto pole je povinné' })}
              />
            </div>
            <div>
              {++i}. Kdy bude akce?{' '}
              <label htmlFor="start">
                Od{' '}
                <input
                  type="datetime-local"
                  id="start"
                  {...register('start')}
                />
              </label>
              <label htmlFor="end">
                Do <input type="date" id="end" {...register('end')} />
              </label>
            </div>
            <div>
              {++i}. Počet akcí v uvedeném období
              <input type="number" {...register('number_of_sub_events')} />
            </div>
            <div>
              {++i}. Typ akce
              <select {...register('category')}>
                {categories &&
                  categories.results!.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              {++i}. Program
              <select {...register('program')}>
                {programs &&
                  programs.results!.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
              </select>
            </div>
          </Step>
          <Step name="pro koho">
            <div>
              {++i}. Pro koho
              <fieldset>
                <Controller
                  name="propagation.intended_for"
                  control={control}
                  rules={
                    {
                      /*required: 'Toto pole je povinné!'*/
                    }
                  }
                  render={({ field: { onChange, value, name, ref } }) => (
                    <>
                      {intendedFor &&
                        intendedFor.results!.map(({ id, name, slug }) => (
                          <Fragment key={id}>
                            <input
                              ref={ref}
                              key={id}
                              type="radio"
                              name={name}
                              id={slug}
                              value={id}
                              checked={id === value}
                              onChange={e => onChange(parseInt(e.target.value))}
                            />
                            <label htmlFor={slug}>{name}</label>
                          </Fragment>
                        ))}
                    </>
                  )}
                />
              </fieldset>
              {
                /* not great hardcoded id */
                +watch('propagation.intended_for') === 5 && (
                  <div>
                    <div>text info pro prvoucastniky</div>
                    <div>Cíle akce a přínos pro prvoúčastníky:</div>
                    <div>
                      Jaké je hlavní téma vaší akce? Jaké jsou hlavní cíle akce?
                      Co nejvýstižněji popište, co akce přináší účastníkům, co
                      zajímavého si zkusí, co se dozví, naučí, v čem se
                      rozvinou…
                    </div>
                    <textarea
                      {...register(
                        'propagation.vip_propagation.goals_of_event',
                      )}
                    ></textarea>
                    <div>Programové pojetí akce pro prvoúčastníky:</div>
                    <div>
                      V základu uveďte, jak bude vaše akce programově a
                      dramaturgicky koncipována (motivační příběh, zaměření
                      programu – hry, diskuse, řemesla,...). Uveďte, jak náplň a
                      program akce reflektují potřeby vaší cílové skupiny
                      prvoúčastníků.
                    </div>
                    <textarea
                      {...register('propagation.vip_propagation.program')}
                    ></textarea>
                    <div>Krátký zvací text do propagace</div>
                    <div>
                      Text (max 200 znaků) -. Ve 2-4 větách nalákejte na vaši
                      akci a zdůrazněte osobní přínos pro účastníky (max. 200
                      znaků).
                    </div>
                    <textarea
                      {...register(
                        'propagation.vip_propagation.short_invitation_text',
                      )}
                    ></textarea>
                    <div>Propagovat akci v Roverském kmeni</div>
                    <Controller
                      name="propagation.vip_propagation.rover_propagation"
                      control={control}
                      rules={
                        {
                          /*required: 'Toto pole je povinné!'*/
                        }
                      }
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
                                name={name}
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
                  </div>
                )
              }
            </div>
          </Step>
          <Step name="lokace">
            <div>{++i}. Lokace (TODO)</div>
          </Step>
          <Step name="info pro účastníky">
            <div>
              <div>{++i}. Účastnický poplatek</div>
              částka <input type="text" {...register('propagation.cost')} />
              snížený poplatek{' '}
              <input type="text" {...register('propagation.discounted_cost')} />
              <div>
                <header>{++i}. Věk</header>
                Od{' '}
                <input type="number" {...register('propagation.minimum_age')} />
                Do{' '}
                <input type="number" {...register('propagation.maximum_age')} />
              </div>
              <div>
                <header>{++i} Ubytování</header>
                <textarea {...register('propagation.accommodation')} />
              </div>
              <div>
                <header>{++i} Strava</header>
                <Controller
                  name="propagation.diets"
                  control={control}
                  rules={
                    {
                      /*required: 'Toto pole je povinné!'*/
                    }
                  }
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
                              checked={field.value.includes(id)}
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
              </div>
            </div>
          </Step>
          <Step name="detaily akce">
            <div>TODO</div>
          </Step>
          <Step name="organizátor">
            <div>
              <div>
                <header>{++i} Hlavní organizátor/ka</header>
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
              </div>
              <div>
                <header>{++i} Organizátorský tým</header>
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
              </div>
            </div>
            <input type="submit" value="Submit" />
          </Step>
        </Steps>
      </form>
    </div>
  )
}

export default CreateEvent
