import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { padStart, startsWith } from 'lodash'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { EventApplication, Question } from './app/services/testApi'
import FormInputError from './components/FormInputError'
import {
  FormSubsubsection,
  InlineSection,
  Label,
} from './components/FormLayout'

type PersonalDataShape = Pick<
  EventApplication,
  'first_name' | 'last_name' | 'email' | 'phone' | 'birthday'
> & { note?: string }

type QuestionnaireShape = { answers: { questionId: number; answer: string }[] }

export type RegistrationFormShape = PersonalDataShape & QuestionnaireShape

const EventRegistrationForm = ({
  id,
  questions,
  onSubmit,
}: {
  id: string
  questions: Question[]
  onSubmit: (data: any) => void
}) => {
  const [step, setStep] = useState(0)
  const handleSubmitPersonalData = (data: PersonalDataShape) => {
    if (questions.length > 0) {
      setStep(1)
    } else {
      onSubmit({ ...data })
    }
    console.log(data)
  }
  const handleSubmitQuestionnaire = (data: QuestionnaireShape) => {
    console.log(data)
  }
  return step === 0 ? (
    <PersonalDataForm onSubmit={handleSubmitPersonalData} />
  ) : (
    <QuestionnaireForm
      questions={questions}
      onSubmit={handleSubmitQuestionnaire}
    />
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
  onSubmit,
}: {
  onSubmit?: (data: PersonalDataShape) => void
}) => {
  const methods = useForm<PersonalDataFormShape>({
    resolver: yupResolver(personalDataSchema),
  })

  const { register, watch, trigger } = methods

  const handleSubmit = methods.handleSubmit(
    data => {
      onSubmit?.(data)
    },
    error => {
      console.log(error)
    },
  )

  // revalidate birthdate when day, month or year is changed
  useEffect(() => {
    const subscription = watch((data, { name, value }) => {
      if (startsWith(name, 'birthdate')) trigger('birthdate')
    })
    return () => subscription.unsubscribe()
  }, [trigger, watch])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
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
              <FormInputError>
                <input
                  type="text"
                  placeholder="DD"
                  maxLength={2}
                  size={2}
                  {...register('birthdate.day')}
                />
              </FormInputError>
              <FormInputError>
                <input
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  size={2}
                  {...register('birthdate.month')}
                />
              </FormInputError>
              <FormInputError>
                <input
                  type="text"
                  placeholder="RRRR"
                  maxLength={4}
                  size={4}
                  {...register('birthdate.year')}
                />
              </FormInputError>
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
        <input type="reset" value="Zrušit" />
        <input type="submit" value="Pokračovat na dotazník" />
      </form>
    </FormProvider>
  )
}

const QuestionnaireForm = ({
  onSubmit,
  questions,
}: {
  onSubmit?: (data: QuestionnaireShape) => void
  questions: Question[]
}) => {
  const methods = useForm<QuestionnaireShape>({
    defaultValues: {
      answers: questions.map(question => ({
        questionId: question.id,
        answer: '',
      })),
    },
  })
  const { register } = methods

  const handleSubmit = methods.handleSubmit(
    data => {
      onSubmit?.(data)
    },
    errors => {
      console.log(errors)
    },
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        {questions.map(question => (
          <FormSubsubsection
            key={question.id}
            header={question.question}
            required={question.is_required}
          >
            <textarea
              {...register(`answers.${question.id}.answer` as const)}
            ></textarea>
          </FormSubsubsection>
        ))}
      </form>
    </FormProvider>
  )
}
