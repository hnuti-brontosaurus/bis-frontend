import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { merge, mergeWith, omit, padStart, pick, startsWith } from 'lodash'
import { FormEventHandler, useEffect } from 'react'
import {
  FieldErrorsImpl,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import * as yup from 'yup'
import { EventApplicationPayload, WebQuestionnaire } from './app/services/bis'
import { EventApplication, Question, User } from './app/services/testApi'
import { Button } from './components/Button'
import FormInputError from './components/FormInputError'
import {
  FormSection,
  FormSubsubsection,
  InlineSection,
  Label,
} from './components/FormLayout'
import { useShowMessage } from './features/systemMessage/useSystemMessage'
import {
  useClearPersistentForm,
  useDirectPersistForm,
  usePersistentFormData,
  usePersistForm,
} from './hooks/persistForm'
import { required } from './utils/validationMessages'

type PersonalDataShape = Pick<
  EventApplication,
  'first_name' | 'last_name' | 'email' | 'phone' | 'birthday'
> & { note?: string }

type QuestionnaireShape = Pick<EventApplicationPayload, 'answers'>

export type RegistrationFormShape = PersonalDataFormShape &
  QuestionnaireShape & { step: 'personal' | 'questions' | 'finished' }

const EventRegistrationForm = ({
  id,
  questionnaire,
  user,
  onSubmit,
  onFinish,
  onCancel,
}: {
  id: string
  questionnaire?: WebQuestionnaire
  user?: User
  onSubmit: (data: EventApplicationPayload) => void
  onFinish: () => void
  onCancel: () => void
}) => {
  const data = usePersistentFormData(
    'registration',
    id,
  ) as RegistrationFormShape

  const clearPersistentData = useClearPersistentForm('registration', id)
  const persist = useDirectPersistForm('registration', id)

  const initialPersonalData = user
    ? merge(
        pick(
          user,
          'first_name',
          'last_name',
          'phone',
          'email',
          'close_person',
          'address',
        ),
        user?.birthday
          ? {
              birthdate: {
                day: dayjs(new Date(user.birthday)).date(),
                month: dayjs(new Date(user.birthday)).month() + 1,
                year: dayjs(new Date(user.birthday)).year(),
              },
            }
          : {},
      )
    : undefined

  const showMessage = useShowMessage()

  const handleSubmit = async () => {
    const birthday = `${data.birthdate.year}-${padStart(
      data.birthdate.month,
      2,
      '0',
    )}-${padStart(data.birthdate.day, 2, '0')}`

    const answers = data.answers.filter(a => a.answer) ?? []

    const submitData = omit(
      mergeWith(
        {},
        data,
        {
          birthday,
          answers,
          close_person: null,
          address: null,
        },
        // mergeWith and this argument make sure arrays get overwritten, not merged
        // https://stackoverflow.com/a/66247134
        (a, b) => (Array.isArray(b) ? b : undefined),
      ),
      ['birthdate', 'step'],
    )
    await onSubmit(submitData)
    clearPersistentData()
    persist({ step: 'finished' })
  }

  const handleReset: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    clearPersistentData()
    onCancel()
  }

  const handleRestart = () => {
    clearPersistentData()
    persist({ step: 'personal' })
  }

  const showQuestionStep = Boolean(
    questionnaire && questionnaire.questions.length > 0,
  )

  const handleClickFinish = () => {
    clearPersistentData()
    onFinish()
  }

  const handleError = (e: any) => {
    showMessage({
      type: 'error',
      message: 'Opravte, prosím, chyby ve formuláři',
      detail: 'TODO better message',
    })
  }

  return !data?.step || data.step === 'personal' ? (
    <PersonalDataForm
      initialData={initialPersonalData}
      isNextStep={showQuestionStep}
      id={id}
      onSubmit={() => {
        if (showQuestionStep) {
          persist({ step: 'questions' })
        } else {
          handleSubmit()
        }
      }}
      onReset={handleReset}
      onError={e => handleError(e)}
    />
  ) : questionnaire && showQuestionStep && data.step === 'questions' ? (
    <QuestionnaireForm
      onBack={() => persist({ step: 'personal' })}
      id={id}
      questions={questionnaire.questions}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onError={e => handleError(e)}
    />
  ) : data.step === 'finished' ? (
    <div>
      {questionnaire?.after_submit_text || 'Děkujeme za přihlášku!'}
      <Button success onClick={handleClickFinish}>
        Hotovo!
      </Button>
      <Button success onClick={handleRestart}>
        Přihlásit někoho dalšího
      </Button>
    </div>
  ) : (
    <>Toto se nemělo stát</>
  )
}

export default EventRegistrationForm

type PersonalDataFormShape = Omit<PersonalDataShape, 'birthday'> & {
  birthdate: {
    day: string
    month: string
    year: string
  }
}
const personalDataSchema: yup.ObjectSchema<PersonalDataFormShape> = yup.object({
  first_name: yup.string().trim().required(),
  last_name: yup.string().trim().required(),
  email: yup.string().email().required(),
  phone: yup.string(),
  note: yup.string(),
  birthdate: yup
    .object({
      day: yup
        .string()
        .matches(/^((0?[1-9])|([12][0-9])|(3[01]))$/)
        .required(),
      month: yup
        .string()
        .matches(/^((0?[1-9])|(1[012]))$/)
        .required(),
      year: yup
        .string()
        .matches(/^\d{4}$/)
        .required(),
    })
    .required()
    .test({
      test: ({ day, month, year }) => {
        const dateString: string = `${year}-${padStart(
          month,
          2,
          '0',
        )}-${padStart(day, 2, '0')}`
        return dayjs(dateString, 'YYYY-MM-DD', true).isValid()
      },
    }),
})

const PersonalDataForm = ({
  id,
  initialData,
  isNextStep,
  onSubmit,
  onReset,
  onError,
}: {
  id: string
  initialData?: Partial<PersonalDataShape>
  isNextStep: boolean
  onSubmit: (data: PersonalDataShape) => void
  onReset: FormEventHandler<HTMLFormElement>
  onError: (e?: FieldErrorsImpl) => void
}) => {
  const persistedData = usePersistentFormData(
    'registration',
    id,
  ) as Partial<RegistrationFormShape>

  const methods = useForm<PersonalDataFormShape>({
    resolver: yupResolver(personalDataSchema),
    defaultValues: merge({}, initialData, persistedData),
  })

  const { register, watch, trigger } = methods
  usePersistForm('registration', id, watch)

  const handleSubmit = methods.handleSubmit(
    data => {
      onSubmit(data)
    },
    error => {
      onError(error)
    },
  )

  // revalidate birthdate when day, month or year is changed
  useEffect(() => {
    const subscription = watch((data, { name, value }) => {
      if (methods.formState.isSubmitted && startsWith(name, 'birthdate'))
        trigger('birthdate')
    })
    return () => subscription.unsubscribe()
  }, [methods.formState.isSubmitted, trigger, watch])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} onReset={onReset}>
        <FormSection>
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
            <FormInputError name="birthdate">
              <div>
                <input
                  type="text"
                  placeholder="DD"
                  maxLength={2}
                  size={2}
                  {...register('birthdate.day')}
                />
                <input
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  size={2}
                  {...register('birthdate.month')}
                />
                <input
                  type="text"
                  placeholder="RRRR"
                  maxLength={4}
                  size={4}
                  {...register('birthdate.year')}
                />
              </div>
            </FormInputError>
          </InlineSection>
          <InlineSection>
            <Label>Telefon</Label>
            <FormInputError>
              <input type="tel" {...register('phone')} />
            </FormInputError>
          </InlineSection>
          <InlineSection>
            <Label required>E-mail</Label>
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
          <nav>
            <Button type="reset">Zrušit</Button>
            <Button success type="submit">
              {isNextStep ? (
                <>
                  Pokračovat na dotazník <FaAngleRight />
                </>
              ) : (
                <>Odeslat přihlášku</>
              )}
            </Button>
          </nav>
        </FormSection>
      </form>
    </FormProvider>
  )
}

const QuestionnaireForm = ({
  id,
  questions,
  onSubmit,
  onReset,
  onBack,
  onError,
}: {
  id: string
  questions: Question[]
  onSubmit: (data: QuestionnaireShape) => void
  onReset: FormEventHandler<HTMLFormElement>
  onBack: () => void
  onError: (e?: FieldErrorsImpl) => void
}) => {
  const persistedData = usePersistentFormData(
    'registration',
    id,
  ) as Partial<RegistrationFormShape>

  const methods = useForm<QuestionnaireShape>({
    defaultValues: merge(
      {
        answers: questions.map(
          question =>
            ({
              question: question.id,
              answer: '',
            } as unknown as EventApplication['answers'][0]),
        ),
      },
      pick(persistedData, 'answers'),
    ),
  })
  const { register, watch, control } = methods
  usePersistForm('registration', id, watch)

  const handleSubmit = methods.handleSubmit(
    data => {
      onSubmit(data)
    },
    errors => {
      onError(errors)
    },
  )

  const { fields } = useFieldArray({ control, name: 'answers' })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} onReset={onReset}>
        <FormSection>
          {fields.map((field, index) => {
            const question = questions[index]
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
          <nav>
            <Button type="button" onClick={onBack}>
              <FaAngleLeft /> Zpět na osobní údaje
            </Button>
            <Button type="reset">Zrušit</Button>
            <Button success type="submit">
              Odeslat přihlášku
            </Button>
          </nav>
        </FormSection>
      </form>
    </FormProvider>
  )
}
