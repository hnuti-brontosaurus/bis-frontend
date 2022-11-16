import { Fragment, useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubheader,
  FormSubsection,
  FullSizeElement,
  InfoBox,
} from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import { getIdBySlug, requireBoolean } from '../../../utils/helpers'
import { required } from '../../../utils/validationMessages'
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
                rules={{ required }}
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
              +watch('intended_for') === 5 && (
                <>
                  <FullSizeElement>
                    <InfoBox>
                      <p>
                        Hnutí Brontosaurus pravidelně vytváří nabídku výběrových
                        dobrovolnických akcí, kterými oslovujeme nové účastníky,
                        zejména středoškolskou mládež a začínající vysokoškoláky
                        (15 - 26 let). Cílem akce je oslovit tyto prvoúčastníky
                        a mít jich nejlépe polovinu, (min. třetinu) z celkového
                        počtu účastníků.
                      </p>
                      <p>
                        Zadáním akce pro prvoúčastníky získáte:
                        <ul>
                          <li>
                            Širší propagaci skrze letáky, osobní kontakty apod.
                            Zveřejnění na letáku VIP propagace.
                          </li>
                          <li>
                            Propagaci na středních školách od lektorů
                            středoškolských programů
                          </li>
                          <li>
                            Zveřejnění na Facebooku a Instagramu HB, reklamu na
                            Facebooku
                          </li>
                          <li>Reklamu v Google vyhledávání</li>
                          <li>Služby grafika HB (dle dohodnutého rozsahu)</li>
                          <li>Přidání do webových katalogů akcí</li>
                          <li>
                            Slevu na inzerci v Roverském kmenu (pro tábory)
                          </li>
                          <li>Zpětnou vazbu k webu a Facebooku akce</li>
                          <li>Metodickou pomoc a pomoc s agendou akce</li>
                          <li>
                            Propagace na novém webu HB v sekci Jedu poprvé
                          </li>
                        </ul>
                      </p>
                    </InfoBox>
                  </FullSizeElement>
                  <FullSizeElement>
                    <FormSubheader>
                      Cíle akce a přínos pro prvoúčastníky:
                    </FormSubheader>
                    <InfoBox>
                      Jaké je hlavní téma vaší akce? Jaké jsou hlavní cíle akce?
                      Co nejvýstižněji popište, co akce přináší účastníkům, co
                      zajímavého si zkusí, co se dozví, naučí, v čem se
                      rozvinou…
                    </InfoBox>
                    <FormInputError>
                      <textarea
                        {...register(
                          'propagation.vip_propagation.goals_of_event',
                        )}
                      ></textarea>
                    </FormInputError>
                  </FullSizeElement>

                  <FullSizeElement>
                    <FormSubheader>
                      Programové pojetí akce pro prvoúčastníky:
                    </FormSubheader>
                    <InfoBox>
                      V základu uveďte, jak bude vaše akce programově a
                      dramaturgicky koncipována (motivační příběh, zaměření
                      programu – hry, diskuse, řemesla,...). Uveďte, jak náplň a
                      program akce reflektují potřeby vaší cílové skupiny
                      prvoúčastníků.
                    </InfoBox>
                    <FormInputError>
                      <textarea
                        {...register('propagation.vip_propagation.program')}
                      ></textarea>
                    </FormInputError>
                  </FullSizeElement>
                  <FullSizeElement>
                    <FormSubheader>
                      Krátký zvací text do propagace:
                    </FormSubheader>
                    <InfoBox>
                      Text (max 200 znaků) -. Ve 2-4 větách nalákejte na vaši
                      akci a zdůrazněte osobní přínos pro účastníky (max. 200
                      znaků).
                    </InfoBox>
                    <FormInputError>
                      <textarea
                        {...register(
                          'propagation.vip_propagation.short_invitation_text',
                        )}
                      ></textarea>
                    </FormInputError>
                  </FullSizeElement>

                  {
                    /*
                        only "camp" can see this
                        https://docs.google.com/document/d/1p3nz0-kVJxwN_pRCYYyhy0BObyGox6LDk35RQPADT4g/edit?disco=AAAAc3SBnZQ
                        */
                    isCamp && (
                      <FullSizeElement>
                        <FormSubheader required>
                          Propagovat akci v Roverském kmeni
                        </FormSubheader>
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
                      </FullSizeElement>
                    )
                  }
                </>
              )
            }
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default IntendedForStep
