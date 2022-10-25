import { Fragment } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import { FormShape } from '../../EventForm'

// Create Event Form Step for Event Category
// In api, Category is called Group

const EventCategoryStep = () => {
  const { control } = useFormContext<FormShape>()
  const { data: groups, isLoading: isEventGroupsLoading } =
    api.endpoints.getEventGroups.useQuery()
  return (
    <fieldset>
      <header>1. Jaký je typ nové akce?</header>
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
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                    <label htmlFor={slug}>{name}</label>
                  </Fragment>
                ))}
            </>
          )}
        />
      </FormInputError>
    </fieldset>
  )
}

export default EventCategoryStep
