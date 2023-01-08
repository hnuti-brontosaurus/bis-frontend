import { api } from 'app/services/bis'
import {
  FormInputError,
  FormSection,
  FormSectionGroup,
  FullSizeElement,
  InlineSection,
  Label,
  Loading,
  NumberInput,
} from 'components'
import { Controller, FormProvider } from 'react-hook-form'
import { required } from 'utils/validationMessages'
import { MethodsShapes } from '..'

export const PropagationStep = ({
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
  const { data: diets } = api.endpoints.readDiets.useQuery()

  if (!diets) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormProvider {...methods}>
      <form>
        <FormSectionGroup startIndex={12}>
          <FormSection
            onWeb
            required
            header="Účastnický poplatek"
            help="Napište výši vašeho účastnického poplatku. Označení Kč se přidá automaticky. Pokud máte více cen (studentskou nebo naopak mecenášskou), výše dalších poplatků napište za lomítko. Můžete uvést i rozmezí cen. Např. 150/200/250 nebo 150-250)"
          >
            <InlineSection>
              <Label htmlFor="propagation.cost">částka</Label>
              <FormInputError>
                <input
                  type="text"
                  id="propagation.cost"
                  maxLength={12}
                  size={12}
                  {...register('propagation.cost', { required })}
                  placeholder="100, 150/200, 150-250"
                />
              </FormInputError>{' '}
              Kč
            </InlineSection>
          </FormSection>
          <FormSection header="Věk" onWeb>
            <InlineSection>
              <Label required htmlFor="propagation.minimum_age">
                Od
              </Label>
              <FormInputError>
                <Controller
                  control={control}
                  name="propagation.minimum_age"
                  rules={{
                    required: required,
                  }}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      min={0}
                      name="propagation.minimum_age"
                    ></NumberInput>
                  )}
                />
              </FormInputError>
              <Label required htmlFor="propagation.maximum_age">
                Do
              </Label>
              <FormInputError>
                <Controller
                  control={control}
                  name="propagation.maximum_age"
                  rules={{
                    required,
                    validate: maxAge =>
                      Number(getValues('propagation.minimum_age')) <=
                        Number(maxAge) ||
                      'Maximální věk musí být vyšší než minimální věk',
                  }}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      min={0}
                      name="propagation.maximum_age"
                    ></NumberInput>
                  )}
                />
              </FormInputError>
            </InlineSection>
          </FormSection>
          {(isWeekendEvent || isCamp) && ( // only camp and weekend
            <FullSizeElement>
              <FormSection required header="Ubytování" onWeb>
                <textarea
                  style={{ maxWidth: '40rem' }}
                  {...register('propagation.accommodation', {
                    required,
                  })}
                />
              </FormSection>
            </FullSizeElement>
          )}
          {(isWeekendEvent || isCamp) && ( // only camp and weekend
            <FormSection
              header="Strava"
              required
              onWeb
              help="Můžete vybrat více druhů stravy."
            >
              <FormInputError>
                <Controller
                  name="propagation.diets"
                  control={control}
                  rules={{ required }}
                  render={({ field }) => (
                    <InlineSection>
                      {[...diets.results]
                        .reverse() // fast hack to show meaty diet last
                        .map(({ id, name }) => (
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
            </FormSection>
          )}
          {/* TODO povinné pouze u dobrovolnických */}
          <FormSection header="Práce" onWeb>
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
                  <Controller
                    control={control}
                    name="propagation.working_days"
                    rules={{
                      required: isVolunteering && required,
                    }}
                    render={({ field }) => (
                      <NumberInput
                        {...field}
                        min={0}
                        name="propagation.working_days"
                      ></NumberInput>
                    )}
                  />
                </FormInputError>
              </InlineSection>
            )}
          </FormSection>
          <FormSection
            header="Web o akci"
            help="Možnost přidat odkaz na webovou stránku vaší akce."
            onWeb
          >
            <FormInputError>
              <input
                type="url"
                id="propagation.web_url"
                {...register('propagation.web_url', {})}
              />
            </FormInputError>
          </FormSection>
          <FormSection
            header="Poznámka"
            help="Možnost přidat interní poznámku. Poznámku uvidí pouze lidé, kteří si mohou tuto akci zobrazit přímo v BISu"
          >
            <FullSizeElement>
              <FormInputError>
                <textarea {...register('internal_note', {})} />
              </FormInputError>
            </FullSizeElement>
          </FormSection>
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
