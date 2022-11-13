import { Controller, useFormContext } from 'react-hook-form'
import Select from 'react-select'
import { api } from '../../../app/services/bis'
import { AdministrationUnit } from '../../../app/services/testApi'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import { EventFormShape } from '../../EventForm'

const BasicInfoStep = () => {
  const { register, control, getValues } = useFormContext<EventFormShape>()
  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: programs } = api.endpoints.getPrograms.useQuery()
  const { data: administrationUnits } =
    api.endpoints.getAdministrationUnits.useQuery({ pageSize: 2000 })

  if (!(administrationUnits && categories && programs))
    return <Loading>Připravujeme formulář</Loading>

  return (
    <>
      <FormSection startIndex={2}>
        <FormSubsection header="Název" required>
          <FormInputError>
            <input
              type="text"
              {...register('name', {
                required: 'Toto pole je povinné',
              })}
            />
          </FormInputError>
        </FormSubsection>
        <FormSubsection header="Kdy bude akce?">
          <label htmlFor="start">
            {/* TODO add required star to these fields */}
            Od{' '}
            <FormInputError name="start">
              <input
                type="date"
                id="start"
                {...register('startDate', { required: 'required' })}
              />
            </FormInputError>
            <FormInputError>
              <input type="time" {...register('startTime')} />
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
        </FormSubsection>
        <FormSubsection
          header="Počet akcí v uvedeném období"
          help="Používá se u opakovaných akcí (např. oddílové schůzky). U klasické jednorázové akce zde nechte jedničku."
          required
        >
          <FormInputError>
            <input
              type="number"
              {...register('number_of_sub_events', {
                required: 'required',
                valueAsNumber: true,
              })}
            />
          </FormInputError>
        </FormSubsection>
      </FormSection>
      <FormSection startIndex={5}>
        <FormSubsection header="Typ akce" required>
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
        </FormSubsection>
        <FormSubsection header="Program" required>
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
        </FormSubsection>
        <FormSubsection header="Pořádající ZČ/Klub/RC/ústředí" required>
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
                      ? administrationUnits.results.map(unit => ({
                          label: `${unit.category.name} ${unit.name}`,
                          value: unit.id,
                        }))
                      : []
                  }
                  onChange={val => onChange(val.map(val => val.value))}
                  defaultValue={(
                    (getValues('administration_units') ?? [])
                      .map(id =>
                        administrationUnits.results.find(
                          unit => id === unit.id,
                        ),
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
        </FormSubsection>
      </FormSection>
    </>
  )
}

export default BasicInfoStep
