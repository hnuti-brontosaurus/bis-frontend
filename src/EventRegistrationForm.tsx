import { yupResolver } from '@hookform/resolvers/yup'
import {
  Actions,
  BirthdayInput,
  birthdayValidation,
  Button,
  FormInputError,
  FormSection,
  FormSubsection,
  FormSubsubsection,
  InlineSection,
  Label,
} from 'components'
import { isNil, merge, mergeWith, omit, omitBy, pick } from 'lodash'
import { FormEventHandler, MouseEventHandler, useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import type { SetNonNullable, SetRequired } from 'type-fest'
import * as yup from 'yup'
import {
  AnswerPayload,
  EventApplicationPayload,
  WebQuestionnaire,
} from './app/services/bis'
import { User } from './app/services/bisTypes'
import styles from './EventRegistration.module.scss'
import { useShowMessage } from './features/systemMessage/useSystemMessage'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from './hooks/persistForm'
import { withOverwriteArray } from './utils/helpers'
import { required } from './utils/validationMessages'

export type RegistrationFormShape = SetRequired<
  SetNonNullable<
    Omit<EventApplicationPayload, 'nickname' | 'health_issues'>,
    'first_name' | 'last_name' | 'phone' | 'email' | 'birthday'
  >,
  'birthday'
> & { isChild: boolean }

export type RegistrationFormShapeWithStep = RegistrationFormShape & {
  step: 'progress' | 'finished'
}

const initialData2form = (
  user?: User,
  questionnaire?: WebQuestionnaire,
): Partial<RegistrationFormShape> => {
  const initialPersonalData = user
    ? pick(
        user,
        'first_name',
        'last_name',
        'phone',
        'email',
        'close_person',
        'birthday',
      )
    : undefined

  const initialQuestionnaireData = {
    answers:
      questionnaire?.questions?.map?.(
        question =>
          ({
            question: question.id,
            answer: '',
            is_required: question.is_required,
          } as AnswerPayload),
      ) ?? [],
  }

  return omitBy(
    merge(
      { close_person: null },
      initialPersonalData,
      initialQuestionnaireData,
    ),
    isNil,
  )
}

const form2payload = (data: RegistrationFormShape): EventApplicationPayload => {
  const answers =
    data.answers
      .map(({ answer, question }) => ({ answer, question }))
      .filter(({ answer }) => Boolean(answer)) ?? []

  const submitData = mergeWith(
    {},
    omit(data, 'isChild', 'step'),
    {
      answers,
      address: null,
      close_person: data.isChild ? data.close_person : null,
    },
    withOverwriteArray,
  )

  return submitData
}

const validationSchema: yup.ObjectSchema<RegistrationFormShape> = yup.object({
  isChild: yup.boolean().defined(),
  first_name: yup.string().trim().required(),
  last_name: yup.string().trim().required(),
  email: yup
    .string()
    .email()
    .when('isChild', {
      is: true,
      then: schema => schema.defined(),
      otherwise: schema => schema.required(),
    }),
  phone: yup
    .string()
    .trim()
    .when('isChild', {
      is: true,
      then: schema => schema.defined(),
      otherwise: schema => schema.required(),
    }),
  note: yup.string(),
  birthday: birthdayValidation.required(),
  close_person: yup
    .object({
      first_name: yup.string().trim().required(),
      last_name: yup.string().trim().required(),
      phone: yup.string().trim().required(),
      email: yup.string().email().required(),
    })
    .when('isChild', {
      is: true,
      then: schema => schema.required(),
      otherwise: schema => schema.notRequired().default(null),
    }),
  answers: yup
    .array()
    .of(
      yup.object({
        question: yup.number().required(),
        is_required: yup.boolean(),
        answer: yup.string().when('is_required', {
          is: true,
          then: schema => schema.required(),
          otherwise: schema => schema.defined(),
        }),
      }),
    )
    .required(),
})

const EventRegistrationForm = ({
  id,
  questionnaire,
  user,
  onSubmit,
  onCancel,
}: {
  id: string
  questionnaire?: WebQuestionnaire
  user?: User
  onSubmit: (data: EventApplicationPayload) => void
  onCancel: () => void
}) => {
  const persistedData = usePersistentFormData(
    'registration',
    id,
  ) as RegistrationFormShapeWithStep

  const clearPersistentData = useClearPersistentForm('registration', id)
  const defaultValues = mergeWith(
    {},
    initialData2form(user, questionnaire),
    persistedData,
    withOverwriteArray,
  )
  const methods = useForm<Omit<RegistrationFormShape, 'step'>>({
    resolver: yupResolver(validationSchema),
    defaultValues: defaultValues.isChild
      ? defaultValues
      : merge({}, defaultValues, { close_person: null }),
  })

  const {
    register,
    watch,
    handleSubmit,
    control,
    trigger,
    formState,
    setValue,
  } = methods

  usePersistForm('registration', id, watch)

  const showMessage = useShowMessage()

  const handleFormSubmit = handleSubmit(
    async data => {
      await onSubmit(form2payload(data))
    },
    error => {
      showMessage({
        type: 'error',
        message: 'Opravte, prosím, chyby ve formuláři',
        // detail: JSON.stringify(error),
      })
    },
  )

  const handleCancel: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    clearPersistentData()
    onCancel()
  }

  const showQuestions = Boolean(
    questionnaire && questionnaire.questions.length > 0,
  )

  const { fields } = useFieldArray({ control, name: 'answers' })

  const isChild = watch('isChild')

  useEffect(() => {
    if (formState.isSubmitted) trigger()
  }, [formState.isSubmitted, isChild, trigger])

  useEffect(() => {
    if (!isChild) setValue('close_person', null)
  }, [isChild, setValue])

  return (
    <>
      {questionnaire?.introduction && (
        <div className={styles.info}>{questionnaire.introduction}</div>
      )}
      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit} onReset={handleCancel}>
          <FormSection>
            <InlineSection>
              <Label>Přihlašuji dítě</Label>
              <FormInputError>
                <input type="checkbox" {...register('isChild')} />
              </FormInputError>
            </InlineSection>
            {isChild && (
              <FormSubsection header="Rodič/zákonný zástupce">
                <InlineSection>
                  <Label required>Jméno</Label>
                  <FormInputError>
                    <input
                      type="text"
                      {...register('close_person.first_name')}
                    />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label required>Příjmení</Label>
                  <FormInputError>
                    <input
                      type="text"
                      {...register('close_person.last_name')}
                    />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label required>Telefon</Label>
                  <FormInputError>
                    <input type="tel" {...register('close_person.phone')} />
                  </FormInputError>
                </InlineSection>
                <InlineSection>
                  <Label required>E-mail</Label>
                  <FormInputError>
                    <input type="email" {...register('close_person.email')} />
                  </FormInputError>
                </InlineSection>
              </FormSubsection>
            )}
            <FormSubsection header={isChild ? 'Dítě' : 'Osobní data'}>
              <InlineSection>
                <Label required>Jméno</Label>
                <FormInputError>
                  <input type="text" {...register('first_name')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label required>Příjmení</Label>
                <FormInputError>
                  <input type="text" {...register('last_name')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label required>Datum narození</Label>
                <FormInputError>
                  <Controller
                    control={control}
                    name="birthday"
                    render={({ field }) => <BirthdayInput {...field} />}
                  />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label required={!isChild}>Telefon</Label>
                <FormInputError>
                  <input type="tel" {...register('phone')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label required={!isChild}>E-mail</Label>
                <FormInputError>
                  <input type="email" {...register('email')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label>Poznámka</Label>
                <FormInputError>
                  <textarea {...register('note')} />
                </FormInputError>
              </InlineSection>
            </FormSubsection>
            {showQuestions && (
              <FormSubsection header="Dotazník">
                {fields.map((field, index) => {
                  const question = questionnaire!.questions[index]
                  return (
                    <FormSubsubsection
                      key={field.id}
                      header={question.question}
                      required={question.is_required}
                    >
                      <FormInputError>
                        <textarea
                          {...register(`answers.${index}.answer` as const, {
                            required: question.is_required && required,
                          })}
                        ></textarea>
                      </FormInputError>
                    </FormSubsubsection>
                  )
                })}
              </FormSubsection>
            )}
            <Actions>
              <Button type="reset">Zrušit</Button>
              <Button success type="submit">
                Odeslat přihlášku
              </Button>
            </Actions>
          </FormSection>
        </form>
      </FormProvider>
    </>
  )
}

export default EventRegistrationForm

export const FinishedStep = ({
  message,
  onFinish,
  onRestart,
}: {
  message: string
  onFinish: MouseEventHandler<HTMLButtonElement>
  onRestart: MouseEventHandler<HTMLButtonElement>
}) => {
  return (
    <div>
      <div className={styles.info}>{message}</div>
      <Actions>
        <Button success onClick={onFinish}>
          Hotovo!
        </Button>
        <Button success onClick={onRestart}>
          Přihlásit někoho dalšího
        </Button>
      </Actions>
    </div>
  )
}
