import { Controller, FormProvider } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubsection,
  FullSizeElement,
  InlineSection,
  Label,
} from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import { SelectUser } from '../../../components/SelectUsers'
import { required } from '../../../utils/validationMessages'
import { MethodsShapes } from '../../EventForm'

const PropagationStep = ({
  methods,
  isVolunteering,
  isWeekendEvent,
  isCamp,
}: {
  methods: MethodsShapes['propagation']
  isVolunteering: boolean
  isWeekendEvent: boolean
  isCamp: boolean
}) => {
  const { control, register, getValues } = methods
  const { data: diets } = api.endpoints.getDiets.useQuery()

  if (!diets) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection>
          <FormSubsection header="Účastnický poplatek">
            <InlineSection>
              <Label required htmlFor="propagation.cost">
                částka{' '}
              </Label>
              <FormInputError>
                <input
                  type="text"
                  id="propagation.cost"
                  maxLength={12}
                  size={12}
                  {...register('propagation.cost', {
                    required: 'required',
                  })}
                />
              </FormInputError>{' '}
              Kč
            </InlineSection>
          </FormSubsection>
          <FormSubsection header="Věk">
            <InlineSection>
              <Label required htmlFor="propagation.minimum_age">
                Od
              </Label>
              <FormInputError>
                <input
                  id="propagation.minimum_age"
                  type="number"
                  size={2}
                  {...register('propagation.minimum_age', {
                    required,
                    valueAsNumber: true,
                  })}
                />
              </FormInputError>
              <Label required htmlFor="propagation.maximum_age">
                Do
              </Label>
              <FormInputError>
                <input
                  id="propagation.maximum_age"
                  type="number"
                  size={2}
                  {...register('propagation.maximum_age', {
                    required,
                    valueAsNumber: true,
                    validate: maxAge =>
                      Number(getValues('propagation.minimum_age')) <=
                        Number(maxAge) ||
                      'Maximální věk musí být vyšší než minimální věk',
                  })}
                />
              </FormInputError>
            </InlineSection>
          </FormSubsection>
          {(isWeekendEvent || isCamp) && ( // only camp and weekend
            <FullSizeElement>
              <FormSubsection required header="Ubytování">
                <textarea
                  style={{ maxWidth: '40rem' }}
                  {...register('propagation.accommodation', {
                    required,
                  })}
                />
              </FormSubsection>
            </FullSizeElement>
          )}
          {(isWeekendEvent || isCamp) && ( // only camp and weekend
            <FormSubsection header="Strava" required>
              <FormInputError>
                <Controller
                  name="propagation.diets"
                  control={control}
                  rules={{ required }}
                  render={({ field }) => (
                    <InlineSection>
                      {[...diets.results]
                        .reverse() // fast hack to show meaty diet last
                        .map(({ id, name, slug }) => (
                          <label key={id}>
                            <input
                              ref={field.ref}
                              key={id}
                              type="checkbox"
                              name={field.name}
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
                            />{' '}
                            {name}
                          </label>
                        ))}
                    </InlineSection>
                  )}
                />
              </FormInputError>
            </FormSubsection>
          )}
          {/* TODO povinné pouze u dobrovolnických */}
          <FormSubsection header="Práce">
            <InlineSection>
              <Label required={isVolunteering}>Denní pracovní doba</Label>
              <FormInputError>
                <input
                  type="text"
                  {...register('propagation.working_hours', {
                    required: isVolunteering && required,
                  })}
                />
              </FormInputError>
            </InlineSection>
            {isCamp && (
              <InlineSection>
                <Label required={isVolunteering}>
                  Počet pracovních dní na akci
                </Label>
                <FormInputError>
                  <input
                    type="number"
                    {...register('propagation.working_days', {
                      required: isVolunteering && required,
                    })}
                  />
                </FormInputError>
              </InlineSection>
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
            <InlineSection>
              <Label required htmlFor="propagation.contact_name">
                Jméno kontaktní osoby
              </Label>
              <FormInputError>
                <input
                  type="text"
                  id="propagation.contact_name"
                  {...register('propagation.contact_name', {
                    required,
                  })}
                />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label required htmlFor="propagation.contact_email">
                Kontaktní email
              </Label>
              <FormInputError>
                <input
                  id="propagation.contact_email"
                  type="email"
                  {...register('propagation.contact_email', {
                    required,
                  })}
                />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label htmlFor="propagation.contact_phone">
                Kontaktní telefon
              </Label>
              <FormInputError>
                <input
                  id="propagation.contact_phone"
                  type="tel"
                  {...register('propagation.contact_phone', {})}
                />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label htmlFor="propagation.web_url">Web o akci</Label>
              <FormInputError>
                <input
                  type="url"
                  id="propagation.web_url"
                  {...register('propagation.web_url', {})}
                />
              </FormInputError>
            </InlineSection>
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default PropagationStep
