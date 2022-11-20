import { Fragment } from 'react'
import { Controller, FormProvider, useFieldArray } from 'react-hook-form'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubsection,
  FormSubsubsection,
  InlineSection,
} from '../../../components/FormLayout'
import { requireBoolean } from '../../../utils/helpers'
import { MethodsShapes } from '../../EventForm'

const RegistrationStep = ({
  methods,
}: {
  methods: MethodsShapes['registration']
}) => {
  const { control, register, watch } = methods
  const questionFields = useFieldArray({
    control,
    name: 'questions',
  })

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection>
          <FormSubsection
            required
            header="Na koho je akce zaměřená"
            help="Akce zaměřená na členy jsou interní akce HB - valné hromady, týmovky atd."
          >
            <FormInputError>
              <Controller
                name={'is_internal'}
                control={control}
                rules={{
                  ...requireBoolean,
                }}
                render={({ field }) => (
                  <InlineSection>
                    {[
                      { name: 'Na členy', value: true },
                      { name: 'Na nečleny', value: false },
                    ].map(({ name, value }) => (
                      <div key={name}>
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
                        />{' '}
                        <label htmlFor={name}>{name}</label>
                      </div>
                    ))}
                  </InlineSection>
                )}
              />
            </FormInputError>
          </FormSubsection>
          <FormSubsection
            required
            header="Zveřejnit na brontosauřím webu"
            help="Pokud zaškrtnete ano, akce se zobrazí na webu www.brontosaurus.cz. Volbu ne zaškrtněte pouze jedná-li se o interní akci HB nebo interní akci Brďa."
          >
            <FormInputError>
              <Controller
                name={'propagation.is_shown_on_web'}
                control={control}
                rules={{ ...requireBoolean }}
                render={({ field }) => (
                  <fieldset>
                    <InlineSection>
                      {[
                        { name: 'Ano', value: true },
                        { name: 'Ne', value: false },
                      ].map(({ name, value }) => (
                        <div key={name}>
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
                          />{' '}
                          <label htmlFor={name}>{name}</label>
                        </div>
                      ))}
                    </InlineSection>
                  </fieldset>
                )}
              />
            </FormInputError>
          </FormSubsection>
          {/*<div>
        <header>
          Způsob přihlášení *! (help?: Způsoby přihlášení na vaši akci na
          www.brontosaurus.cz, které se zobrazí po kliknutí na tlačítko “chci
          jet”:
        </header>
          </div>*/}
          <FormSubsection header="Je požadována registrace?" required>
            <FormInputError>
              <Controller
                name={'registration.is_registration_required'}
                control={control}
                rules={{
                  ...requireBoolean,
                }}
                render={({ field }) => (
                  <>
                    {[
                      { name: 'Ano', value: true },
                      { name: 'Ne', value: false },
                    ].map(({ name, value }) => (
                      <Fragment key={name}>
                        <input
                          ref={field.ref}
                          type="radio"
                          name={field.name}
                          id={name}
                          value={String(value)}
                          checked={field.value === value}
                          onChange={e => {
                            field.onChange(
                              e.target.value === 'true'
                                ? true
                                : e.target.value === 'false'
                                ? false
                                : undefined,
                            )
                          }}
                        />
                        <label htmlFor={name}>{name}</label>
                      </Fragment>
                    ))}
                  </>
                )}
              />
            </FormInputError>
            <div>
              <FormInputError>
                <input
                  type="checkbox"
                  id="is_event_full"
                  {...register('registration.is_event_full')}
                />
              </FormInputError>
              <label htmlFor="is_event_full">Akce je plná</label>
            </div>
          </FormSubsection>

          {watch('registration.is_registration_required') && (
            <FormSubsubsection header="Přihláška">
              <div>
                <FormInputError>
                  <textarea
                    placeholder="úvod"
                    {...register('registration.questionnaire.introduction')}
                  />
                </FormInputError>
              </div>
              <div>
                <FormInputError>
                  <textarea
                    placeholder="text po odeslání"
                    {...register(
                      'registration.questionnaire.after_submit_text',
                    )}
                  />
                </FormInputError>
              </div>
              <div>
                <header>Otázky</header>
                <ul>
                  {questionFields.fields.map((item, index) => (
                    <li key={item.id}>
                      <input
                        type="text"
                        {...register(`questions.${index}.question` as const)}
                      />
                      <label>
                        <input
                          type="checkbox"
                          {...register(
                            `questions.${index}.is_required` as const,
                          )}
                        />{' '}
                        povinné?
                      </label>
                      <button
                        type="button"
                        onClick={() => questionFields.remove(index)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => questionFields.append({ question: '' })}
                >
                  append
                </button>
              </div>
            </FormSubsubsection>
          )}
          {/*
                <pre>
                  {`
Způsob přihlášení *! (help?: Způsoby přihlášení na vaši akci na www.brontosaurus.cz, které se zobrazí po kliknutí na tlačítko “chci jet”:
standardní přihláška na brontowebu (doporučujeme!) -  Je jednotná pro celé HB. Do této přihlášky si můžete přidat 4 vlastní otázky. Vyplněné údaje se pak rovnou zobrazí v BIS, což tobě i kanceláři ulehčí práci.
jiná elektornická přihláška -  Přesměruje zájemce na vaši přihlášku. 
přihlášení na e-mail organizátora - Přesměruje zájemce na outlook s kontaktním emailem.
Registrace není potřeba, stačí přijít - Zobrazí se jako text u vaší akce.
Máme bohužel plno, zkuste jinou z našich akcí - Zobrazí se jako text u vaší akce.)

Standardní přihláška na brontowebu
Fce: tlačítko chci jet odkáže na: vyplnit předdefinovaný brontosauří formulář
Jiná elektronická přihláška
Fce: tlačítko chci jet = proklik na jinou elektronickou přihlášku
přihlášení  na mail organizátora
Fce: tlačítko chci jet = otevření outlook, kde je příjemce mail organizátora
Registrace není potřeba, stačí přijít
FCE: propíše se na web, že není třeba se hlásit
Máme bohužel plno, zkuste jinou z našich akcí
Fce: propíše se to na web

při vybrání možnosti “Standardní příhláška na brontowebu” se objeví tyto položky 
(help? - Zde můžeš připsat svoje doplňující otázky pro účastníky, které se zobrazí u standartní přihlášky na brontowebu)
Otázka 1
Otázka 2
Otázka 3
Otázka 4

při vybrání možnosti “jiná elektronická přihláška” se zobrazí políčko
URL tvé přihlášky
Fce: proklik na přihlášky vytvořenou externě`}
                </pre>
*/}
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default RegistrationStep
