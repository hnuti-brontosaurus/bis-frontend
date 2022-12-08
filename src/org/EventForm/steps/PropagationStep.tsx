import {
  FormInputError,
  FormSection,
  FormSubsection,
  FullSizeElement,
  InlineSection,
  Label,
  Loading,
} from 'components'
import { Controller, FormProvider } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import { required } from '../../../utils/validationMessages'
import { MethodsShapes } from '../EventForm'

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
        <FormSection startIndex={13}>
          <FormSubsection
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
                  {...register('propagation.cost', {
                    required: 'required',
                  })}
                  placeholder="100, 150/200, 150-250"
                />
              </FormInputError>{' '}
              Kč
            </InlineSection>
          </FormSubsection>
          <FormSubsection header="Věk" onWeb>
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
              <FormSubsection required header="Ubytování" onWeb>
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
            <FormSubsection
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
          <FormSubsection header="Práce" onWeb>
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
          <FormSubsection
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
          </FormSubsection>
          <FormSubsection
            header="Poznámka"
            help="Možnost přidat interní poznámku. Poznámku uvidí pouze lidé, kteří si mohou tuto akci zobrazit přímo v BISu"
          >
            <FormInputError>
              <input type="text" {...register('internal_note', {})} />
            </FormInputError>
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default PropagationStep
