import { Fragment, useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import { getIdBySlug, requireBoolean } from '../../../utils/helpers'
import { MethodsShapes } from '../../EventForm'

const IntendedForStep = ({
  methods,
  isCamp,
}: {
  methods: MethodsShapes['intendedFor']
  isCamp: boolean
}) => {
  const { data: intendedFor } = api.endpoints.getIntendedFor.useQuery()
  const { watch, register, control, unregister, setValue } = methods

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

  if (!intendedFor) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection startIndex={8}>
          <FormSubsection required header="Pro koho">
            <FormInputError>
              <Controller
                name="intended_for"
                control={control}
                rules={{
                  required: 'Toto pole je povinné!',
                }}
                render={({ field }) => (
                  <fieldset>
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
                  </fieldset>
                )}
              />
            </FormInputError>
            {
              /* not great hardcoded id */
              watch('intended_for') === 5 && (
                <div>
                  <div>text info pro prvoucastniky</div>
                  <div>Cíle akce a přínos pro prvoúčastníky:</div>
                  <div>
                    Jaké je hlavní téma vaší akce? Jaké jsou hlavní cíle akce?
                    Co nejvýstižněji popište, co akce přináší účastníkům, co
                    zajímavého si zkusí, co se dozví, naučí, v čem se rozvinou…
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
                    programu – hry, diskuse, řemesla,...). Uveďte, jak náplň a
                    program akce reflektují potřeby vaší cílové skupiny
                    prvoúčastníků.
                  </div>
                  <FormInputError>
                    <textarea
                      {...register('propagation.vip_propagation.program')}
                    ></textarea>
                  </FormInputError>
                  <div>Krátký zvací text do propagace</div>
                  <div>
                    Text (max 200 znaků) -. Ve 2-4 větách nalákejte na vaši akci
                    a zdůrazněte osobní přínos pro účastníky (max. 200 znaků).
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
                    isCamp && (
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
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default IntendedForStep
