import { Fragment } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import { SelectUser } from '../../../components/SelectUsers'
import { getIdBySlug, getIdsBySlugs } from '../../../utils/helpers'
import { EventFormShape } from '../../EventForm'

const PropagationStep = () => {
  const { data: groups } = api.endpoints.getEventGroups.useQuery()
  const { control, register, watch, getValues } =
    useFormContext<EventFormShape>()
  const { data: diets } = api.endpoints.getDiets.useQuery()

  if (!(groups && diets)) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormSection>
      <FormSubsection header="Účastnický poplatek">
        částka{' '}
        <FormInputError>
          <input
            type="text"
            {...register('propagation.cost', {
              required: 'required',
            })}
          />
        </FormInputError>
      </FormSubsection>
      <FormSubsection header="Věk">
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
      </FormSubsection>
      {getIdsBySlugs(groups?.results ?? [], ['camp', 'weekend_event']).includes(
        watch('group'),
      ) && ( // only camp and weekend
        <FormSubsection header="Ubytování">
          <textarea
            {...register('propagation.accommodation', {
              required: 'required',
            })}
          />
        </FormSubsection>
      )}
      {getIdsBySlugs(groups?.results ?? [], ['camp', 'weekend_event']).includes(
        watch('group'),
      ) && ( // only camp and weekend
        <FormSubsection header="Strava">
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
                          checked={field.value && field.value.includes(id)}
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
        </FormSubsection>
      )}
      <FormSubsection header="Denní pracovní doba">
        <FormInputError>
          {/* TODO probably change to text. Number doesn't allow partial hours */}
          <input
            type="number"
            {...register('propagation.working_hours', {
              required: 'required',
            })}
          />
        </FormInputError>
        {getIdBySlug(groups?.results ?? [], 'camp') === watch('group') && (
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
      </FormSubsection>
      <FormSubsection header="Kontaktní osoba">
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
            <input type="tel" {...register('propagation.contact_phone', {})} />
          </FormInputError>
        </div>
        <div>
          Web o akci
          <FormInputError>
            <input type="url" {...register('propagation.web_url', {})} />
          </FormInputError>
        </div>
      </FormSubsection>
    </FormSection>
  )
}

export default PropagationStep
