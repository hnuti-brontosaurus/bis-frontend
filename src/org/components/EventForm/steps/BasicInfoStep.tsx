import { api } from 'app/services/bis'
import { AdministrationUnit } from 'app/services/bisTypes'
import {
  FormInputError,
  FormSection,
  FormSectionGroup,
  FullSizeElement,
  InlineSection,
  Label,
  Loading,
} from 'components'
import { Controller, FormProvider } from 'react-hook-form'
import Select from 'react-select'
import { required } from 'utils/validationMessages'
import { MethodsShapes } from '..'

export const BasicInfoStep = ({
  methods,
}: {
  methods: MethodsShapes['basicInfo']
}) => {
  const { register, control, getValues } = methods
  const { data: categories } = api.endpoints.readEventCategories.useQuery()
  const { data: programs } = api.endpoints.readPrograms.useQuery()
  const { data: administrationUnits } =
    api.endpoints.readAdministrationUnits.useQuery({ pageSize: 2000 })

  if (!(administrationUnits && categories && programs))
    return <Loading>Připravujeme formulář</Loading>

  return (
    <FormProvider {...methods}>
      <form>
        <FormSectionGroup startIndex={2}>
          <FormSection header="Název" required onWeb>
            <FormInputError>
              <input
                type="text"
                {...register('name', {
                  required,
                })}
              />
            </FormInputError>
          </FormSection>
          <FormSection header="Kdy bude akce?" onWeb>
            <InlineSection>
              <InlineSection>
                <Label htmlFor="start" required>
                  {/* TODO add required star to these fields */}
                  Od
                </Label>
                <FormInputError>
                  <input
                    type="date"
                    id="start"
                    {...register('start', { required })}
                  />
                </FormInputError>
                <FormInputError>
                  <input type="time" {...register('start_time')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label htmlFor="end" required>
                  Do
                </Label>
                <FormInputError>
                  <input
                    type="date"
                    id="end"
                    {...register('end', { required })}
                  />
                </FormInputError>
              </InlineSection>
            </InlineSection>
          </FormSection>
          <FormSection
            header="Počet akcí v uvedeném období"
            help="Používá se u opakovaných akcí (např. oddílové schůzky). U klasické jednorázové akce zde nechte jedničku."
            required
          >
            <FormInputError>
              <input
                size={2}
                type="number"
                {...register('number_of_sub_events', {
                  required,
                  valueAsNumber: true,
                })}
              />
            </FormInputError>
          </FormSection>
        </FormSectionGroup>
        <FormSectionGroup startIndex={5}>
          <FormSection header="Typ akce" required>
            <FullSizeElement>
              <FormInputError>
                <select {...register('category', { required })} defaultValue="">
                  <option disabled value="" />
                  {categories &&
                    categories.results!.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </FormInputError>
            </FullSizeElement>
          </FormSection>
          <FormSection header="Program" required>
            <FullSizeElement>
              <FormInputError>
                <select {...register('program', { required })} defaultValue="">
                  <option disabled value="" />
                  {programs &&
                    programs.results!.map(program => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                </select>
              </FormInputError>
            </FullSizeElement>
          </FormSection>
          <FormSection header="Pořádající organizační jednotka" required onWeb>
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="administration_units"
                  rules={{ required }}
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
            </FullSizeElement>
          </FormSection>
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
