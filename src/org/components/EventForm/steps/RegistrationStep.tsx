import {
  Button,
  FormInputError,
  FormSection,
  FormSectionGroup,
  FormSubsection,
  FullSizeElement,
  InlineSection,
  Label,
} from 'components'
import { form as formTexts } from 'config/static/event'
import { Controller, FormProvider, useFieldArray } from 'react-hook-form'
import { FaTrashAlt } from 'react-icons/fa'
import { requireBoolean } from 'utils/helpers'
import * as messages from 'utils/validationMessages'
import { MethodsShapes } from '..'
import styles from './RegistrationStep.module.scss'

export const RegistrationStep = ({
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
        <FormSectionGroup startIndex={10}>
          <FormSection
            required
            header="Zveřejnit na brontosauřím webu"
            help={formTexts.propagation.is_shown_on_web.help}
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
                        <label key={name}>
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
                          {name}
                        </label>
                      ))}
                    </InlineSection>
                  </fieldset>
                )}
              />
            </FormInputError>
          </FormSection>

          <FormSection
            header="Způsob přihlášení"
            required
            onWeb
            help={formTexts.registrationMethod.help}
          >
            <FormInputError name="registrationMethod">
              <fieldset>
                {[
                  {
                    name: 'Standardní přihláška na brontowebu',
                    value: 'standard',
                  },
                  { name: 'Jiná elektronická přihláška', value: 'other' },
                  {
                    name: 'Registrace není potřeba, stačí přijít',
                    value: 'none',
                  },
                  {
                    name: 'Máme bohužel plno, zkuste jinou z našich akcí',
                    value: 'full',
                  },
                ].map(({ name, value }) => (
                  <label key={value}>
                    <input
                      type="radio"
                      value={value}
                      id={`registration-method-${value}`}
                      {...register('registrationMethod', {
                        required: messages.required,
                      })}
                    />{' '}
                    {name}
                  </label>
                ))}
              </fieldset>
            </FormInputError>
          </FormSection>

          {watch('registrationMethod') === 'other' && (
            <InlineSection>
              <Label required>Odkaz na přihlášku</Label>{' '}
              <FormInputError>
                <input
                  type="url"
                  {...register('registration.alternative_registration_link', {
                    required: messages.required,
                    validate: {
                      url: value => {
                        try {
                          new URL(value as string)
                          return true
                        } catch (e) {
                          return messages.url
                        }
                      },
                    },
                  })}
                  placeholder="odkaz na vaši přihlášku"
                />
              </FormInputError>
            </InlineSection>
          )}

          {/* {watch('registration.is_registration_required') && ( */}
          {watch('registrationMethod') === 'standard' && (
            <FormSubsection
              header="Přihláška"
              help={formTexts.registration.questionnaire.help}
            >
              <FormSubsection
                required
                header="Úvod k dotazníku"
                help={formTexts.registration.questionnaire.introduction.help}
              >
                <FullSizeElement>
                  <FormInputError>
                    <textarea
                      {...register('registration.questionnaire.introduction', {
                        required: messages.required,
                      })}
                    />
                  </FormInputError>
                </FullSizeElement>
              </FormSubsection>
              <FormSubsection
                required
                header="Text po odeslání"
                help={
                  formTexts.registration.questionnaire.after_submit_text.help
                }
              >
                <FullSizeElement>
                  <FormInputError>
                    <textarea
                      {...register(
                        'registration.questionnaire.after_submit_text',
                        { required: messages.required },
                      )}
                    />
                  </FormInputError>
                </FullSizeElement>
              </FormSubsection>
              <FormSubsection header="Otázky">
                <div className={styles.questionsBox}>
                  <ul>
                    {questionFields.fields.map((item, index) => (
                      <li key={item.id}>
                        <div className={styles.question}>
                          Otazka {index + 1}:
                          <div className={styles.questionInputGroup}>
                            <FormInputError className={styles.questionInput}>
                              <input
                                type="text"
                                {...register(
                                  `questions.${index}.question` as const,
                                  { required: messages.required },
                                )}
                              />
                            </FormInputError>
                            <label className={styles.questionRequired}>
                              <input
                                type="checkbox"
                                {...register(
                                  `questions.${index}.is_required` as const,
                                )}
                              />{' '}
                              povinné?
                            </label>
                            <Button
                              type="button"
                              danger
                              onClick={() => questionFields.remove(index)}
                              className={styles.delete}
                            >
                              <FaTrashAlt /> <span>smazat</span>
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.questionsAddNew}>
                    {questionFields.fields.length === 0 &&
                      'Nejsou pridane zadne otazky '}
                    <Button
                      type="button"
                      secondary
                      onClick={() => questionFields.append({ question: '' })}
                    >
                      Přidat otázku
                    </Button>
                  </div>
                </div>
              </FormSubsection>
            </FormSubsection>
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
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
