import { Fragment, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Select from 'react-select'
import { api } from './app/services/bis'
import { Event } from './app/services/testApi'

const CreateEvent = () => {
  let i = 0
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm<Event>()

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

  const handleFormSubmit = handleSubmit(async data => {
    console.log(data)
  })
  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        {/* kategorie akce */}
        <fieldset>
          {++i}. Jaký je typ nové akce?
          {groups &&
            groups.results!.map(({ id, name, slug }) => (
              <Fragment key={id}>
                <input
                  key={id}
                  type="radio"
                  id={slug}
                  {...register('group.id')}
                  value={id}
                />
                <label htmlFor={slug}>{name}</label>
              </Fragment>
            ))}
        </fieldset>
        {/* podstavové info */}
        <div>
          {++i}. Název
          <input type="text" {...register('name')} />
        </div>
        <div>
          {++i}. Kdy bude akce?{' '}
          <label htmlFor="start">
            Od <input type="datetime-local" id="start" {...register('start')} />
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
          <select {...register('category.id')}>
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
          <select {...register('program.id')}>
            {programs &&
              programs.results!.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
          </select>
        </div>
        {/* pro koho */}
        <div>
          {++i}. Pro koho
          <fieldset>
            {intendedFor &&
              intendedFor.results!.map(({ id, slug, name }) => {
                return (
                  <Fragment key={id}>
                    <input
                      type="radio"
                      id={slug}
                      {...register('propagation.intended_for.id')}
                      value={id}
                    />
                    <label htmlFor={slug}>{name}</label>
                  </Fragment>
                )
              })}
          </fieldset>
          {
            /* not great hardcoded id */
            +watch('propagation.intended_for.id') === 5 && (
              <div>
                <div>text info pro prvoucastniky</div>
                <div>Cíle akce a přínos pro prvoúčastníky:</div>
                <div>
                  Jaké je hlavní téma vaší akce? Jaké jsou hlavní cíle akce? Co
                  nejvýstižněji popište, co akce přináší účastníkům, co
                  zajímavého si zkusí, co se dozví, naučí, v čem se rozvinou…
                </div>
                <textarea
                  {...register('propagation.vip_propagation.goals_of_event')}
                ></textarea>
                <div>Programové pojetí akce pro prvoúčastníky:</div>
                <div>
                  V základu uveďte, jak bude vaše akce programově a
                  dramaturgicky koncipována (motivační příběh, zaměření programu
                  – hry, diskuse, řemesla,...). Uveďte, jak náplň a program akce
                  reflektují potřeby vaší cílové skupiny prvoúčastníků.
                </div>
                <textarea
                  {...register('propagation.vip_propagation.program')}
                ></textarea>
                <div>Krátký zvací text do propagace</div>
                <div>
                  Text (max 200 znaků) -. Ve 2-4 větách nalákejte na vaši akci a
                  zdůrazněte osobní přínos pro účastníky (max. 200 znaků).
                </div>
                <textarea
                  {...register(
                    'propagation.vip_propagation.short_invitation_text',
                  )}
                ></textarea>
                <div>Propagovat akci v Roverském kmeni</div>
                <label>
                  <input
                    type="radio"
                    {...register(
                      'propagation.vip_propagation.rover_propagation',
                    )}
                    value="yes"
                  />
                  yes
                </label>
                <label>
                  <input
                    type="radio"
                    {...register(
                      'propagation.vip_propagation.rover_propagation',
                    )}
                    value="no"
                  />
                  no
                </label>
              </div>
            )
          }
        </div>
        {/* lokace */}
        <div>{++i}. Lokace (TODO)</div>
        {/* info pro účastníky */}
        <div>
          <div>{++i}. Účastnický poplatek</div>
          částka <input type="text" {...register('propagation.cost')} />
          snížený poplatek{' '}
          <input type="text" {...register('propagation.discounted_cost')} />
          <div>
            <header>{++i}. Věk</header>
            Od <input type="number" {...register('propagation.minimum_age')} />
            Do <input type="number" {...register('propagation.maximum_age')} />
          </div>
          <div>
            <header>{++i} Ubytování</header>
            <textarea {...register('propagation.accommodation')} />
          </div>
          <div>
            <header>{++i} Strava</header>
            {diets &&
              diets.results!.map(({ id, name, slug }) => (
                <Fragment key={id}>
                  <input
                    type="checkbox"
                    id={slug}
                    {...register('propagation.diets')}
                    value={id}
                  />
                  <label htmlFor={slug}>{name}</label>
                </Fragment>
              ))}
          </div>
        </div>
        {/* detaily akce */}
        <div>TODO</div>
        {/* organizátor */}
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
                />
              )}
            />
          </div>
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

export default CreateEvent
