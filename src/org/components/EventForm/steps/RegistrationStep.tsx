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
import { FaPlus, FaTrashAlt } from 'react-icons/fa'
import { requireBoolean } from 'utils/helpers'
import * as messages from 'utils/validationMessages'
import { MethodsShapes } from '..'
import styles from './RegistrationStep.module.scss'

export type QuestionType = 'text' | 'radio' | 'checkbox'

const questionTypes: { type: QuestionType; name: string }[] = [
  { type: 'text', name: 'Text' },
  { type: 'radio', name: 'Možnosti' },
  { type: 'checkbox', name: 'Možnosti (více)' },
]

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

  const isNotOnWeb = watch('propagation.is_shown_on_web') === false

  return (
    <FormProvider {...methods}>
      <form>
        <FormSectionGroup startIndex={10}>
          <FormSection
            required
            header={formTexts.propagation.is_shown_on_web.name}
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
                        <label key={name} className="radioLabel">
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

          {!isNotOnWeb && (
            <>
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
                      <label key={value} className="radioLabel">
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
                      {...register(
                        'registration.alternative_registration_link',
                        {
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
                        },
                      )}
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
                    help={
                      formTexts.registration.questionnaire.introduction.help
                    }
                  >
                    <FullSizeElement>
                      <FormInputError>
                        <textarea
                          {...register(
                            'registration.questionnaire.introduction',
                            { required: messages.required },
                          )}
                        />
                      </FormInputError>
                    </FullSizeElement>
                  </FormSubsection>
                  <FormSubsection
                    required
                    header="Text po odeslání"
                    help={
                      formTexts.registration.questionnaire.after_submit_text
                        .help
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
                              Otázka {index + 1}:
                              <div className={styles.questionInputGroup}>
                                <FormInputError
                                  className={styles.questionInput}
                                >
                                  <input
                                    type="text"
                                    {...register(
                                      `questions.${index}.question` as const,
                                      { required: messages.required },
                                    )}
                                  />
                                </FormInputError>
                                <FormInputError>
                                  <select
                                    {...register(`questions.${index}.type`, {
                                      required: messages.required,
                                    })}
                                  >
                                    {questionTypes.map(({ type, name }) => (
                                      <option key={type} value={type}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                </FormInputError>
                                <label
                                  className={
                                    (styles.questionRequired, 'checkboxLabel')
                                  }
                                >
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
                            {['radio', 'checkbox'].includes(
                              watch(`questions.${index}.type`),
                            ) && (
                              <QuestionOptions
                                question={index}
                                methods={methods}
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className={styles.questionsAddNew}>
                        {questionFields.fields.length === 0 &&
                          'Nejsou přidané žádné otázky '}
                        <Button
                          type="button"
                          secondary
                          onClick={() =>
                            questionFields.append({
                              question: '',
                              type: 'text',
                              options: [{ option: '' }],
                            })
                          }
                        >
                          <FaPlus /> Přidat otázku
                        </Button>
                      </div>
                    </div>
                  </FormSubsection>
                </FormSubsection>
              )}
            </>
          )}
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}

const QuestionOptions = ({
  question,
  methods,
}: {
  question: number
  methods: MethodsShapes['registration']
}) => {
  const { control, register } = methods
  const optionFields = useFieldArray({
    control,
    name: `questions.${question}.options`,
  })

  return (
    <div className={styles.options}>
      <ul>
        {optionFields.fields.map((item, index) => (
          <li key={item.id} className={styles.option}>
            Možnost {index + 1}:{' '}
            <FormInputError>
              <input
                {...register(`questions.${question}.options.${index}.option`, {
                  required: messages.required,
                })}
              />
            </FormInputError>
            <button
              type="button"
              onClick={() => optionFields.remove(index)}
              className={styles.delete}
            >
              <FaTrashAlt /> <span>smazat</span>
            </button>
          </li>
        ))}
      </ul>
      <Button
        secondary
        type="button"
        onClick={() => {
          optionFields.append({ option: '' })
        }}
      >
        <FaPlus /> Přidat možnost
      </Button>
    </div>
  )
}
