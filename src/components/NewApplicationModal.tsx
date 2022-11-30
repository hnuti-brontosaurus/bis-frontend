import { yupResolver } from '@hookform/resolvers/yup'
import { FC, FormEventHandler } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import Modal from 'react-modal'
import * as yup from 'yup'
import { AnswerPayload, api } from '../app/services/bis'
import { EventApplication } from '../app/services/testApi'
import { required } from '../utils/validationMessages'
import FormInputError from './FormInputError'
import { FullSizeElement, InlineSection, Label } from './FormLayout'
import styles from './NewApplicationModal.module.scss'

interface INewApplicationModalProps {
  open: boolean
  onClose: () => void
  eventId: number
}

const phoneRegExp = /^(\+|00){0,1}[0-9]{1,3}[0-9]{4,14}(?:x.+)?$/
const zipcodeRegExp = /\d{3} ?\d{2}/

// TODO: This modal is still WIP (no need to review atm)

const NewApplicationModal: FC<INewApplicationModalProps> = ({
  open,
  onClose,
  eventId,
}) => {
  const [createEventApplication, { isLoading: isSavingOpportunity }] =
    api.endpoints.createEventApplication.useMutation()

  const { data: questions } = api.endpoints.readEventQuestions.useQuery({
    eventId,
  })

  const validationSchema = yup.object().shape(
    {
      // first_name: yup.string().required('Required').trim(),
      last_name: yup.string().required('Required'),
      nickname: yup.string().trim(),
      email: yup.string().email().required('email or phone is required'),
      // otherwise: schema => schema.string(),
      phone: yup.string().required(),
      // .matches(phoneRegExp, 'Phone number is not valid'),
      birthday: yup
        .date()
        .nullable()
        .transform((curr, orig) => (orig === '' ? null : curr)),
      close_person: yup.object().shape({
        first_name: yup.string(),
        last_name: yup.string(),
        email: yup.string().email(),
        //TODO: fix this phone typoe checking
        phone: yup.string(), //.matches(phoneRegExp, 'Phone number is not valid'),
      }),
      answers: yup.array().of(
        yup.object({
          is_required: yup.boolean(),
          answer: yup.string().when('is_required', {
            is: true,
            then: schema => schema.required('Musisz odpvedet na tu otazku'),
          }),
        }),
      ),
    },
    [['email', 'phone']],
  )

  const methods = useForm<EventApplication>({
    resolver: yupResolver(validationSchema),
    // defaultValues: {
    //   first_name: 'Talita',
    //   last_name: 'Dzik',
    //   email: 'examplke@exaple.com',
    //   address: {
    //     street: 'Slowicza',
    //     zip_code: '05807',
    //     city: 'Podkowa Lesna',
    //     //TODO: region: 1, //{ id: 1, name: 'praha' },
    //   },
    //   close_person: {
    //     first_name: 'close',
    //     last_name: 'jdjdjdjdjd',
    //     email: 'dzik@example.com',
    //   },
    // },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.stopPropagation()
    handleSubmit(async data => {
      // await createEventApplication({
      //   application: { ...data, answers: [] },
      //   eventId,
      // }
      let filteredAnswers: AnswerPayload[] = []
      if (data.answers) {
        filteredAnswers = data.answers
          .filter(answer => answer.answer !== '')
          .map(answer => ({
            answer: answer.answer,
            question: answer.question.id,
          }))
      }

      console.log('MMMMMMMMMMMMMMMMM', filteredAnswers)
      // TODO: change the type of event data woith answers
      const eventDataWithAnswers = {
        application: {
          ...data,
          answers: filteredAnswers,
          address: null,
          close_person: null,
          birthday: '1910-10-10',
        },
        eventId,
      }
      console.log('ANSWERS DATA', eventDataWithAnswers)

      await createEventApplication(eventDataWithAnswers)
      onClose()
    })(e)
  }
  if (!open) return null

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => {
        onClose()
        reset()
      }}
      contentLabel="Example Modal"
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div
        onClick={e => {
          e.stopPropagation()
        }}
        className={styles.content}
      >
        <div className={styles.modalTitleBox}>
          <h2>Nova prihlaska</h2>
        </div>
        <div className={styles.modalFormBox}>
          <FormProvider {...methods}>
            <form onSubmit={handleFormSubmit}>
              <>
                <h3>Dane prihlaseneho:</h3>

                <InlineSection>
                  <Label htmlFor="first_name" required>
                    Jmeno
                  </Label>
                  <FormInputError>
                    <input
                      type="text"
                      id="first_name"
                      {...register('first_name', { required: 'jaaaaaaaaa' })}
                    />
                  </FormInputError>
                  <Label htmlFor="last_name" required>
                    Prijmeni
                  </Label>
                  <FormInputError>
                    <input
                      type="text"
                      id="last_name"
                      {...register('last_name', { required })}
                    />
                  </FormInputError>
                </InlineSection>

                <InlineSection>
                  <Label htmlFor="nickname">Prezdivka</Label>
                  <FormInputError>
                    <input
                      type="text"
                      id="nickname"
                      {...register('nickname')}
                    />
                  </FormInputError>
                </InlineSection>

                <InlineSection>
                  <Label htmlFor="phone" required>
                    Telefon
                  </Label>
                  <FormInputError>
                    <input type="tel" id="phone" {...register('phone')} />
                  </FormInputError>
                  <Label htmlFor="email" required>
                    E-mail
                  </Label>
                  <FormInputError>
                    <input type="email" id="email" {...register('email')} />
                  </FormInputError>
                </InlineSection>

                <InlineSection>
                  <Label htmlFor="birthday">Datum narozeni</Label>
                  <FormInputError>
                    <input
                      type="date"
                      id="birthday"
                      {...register('birthday')}
                    />
                  </FormInputError>
                </InlineSection>

                <InlineSection>
                  <Label htmlFor="health_issues">
                    Alergie a zdravotni omezeni:
                  </Label>
                  <FormInputError>
                    <textarea
                      id="health_issues"
                      {...register('health_issues')}
                    />
                  </FormInputError>
                </InlineSection>

                <h3>Bliska osoba:</h3>

                <InlineSection>
                  <Label htmlFor="close_person_first_name">Jmeno</Label>
                  <FormInputError>
                    <input
                      type="text"
                      id="close_person_first_name"
                      {...register('close_person.first_name')}
                    />
                  </FormInputError>
                  <Label htmlFor="close_person_last_name">Prijmeni</Label>
                  <FormInputError>
                    <input
                      type="text"
                      id="close_person_last_name"
                      {...register('close_person.last_name')}
                    />
                  </FormInputError>
                </InlineSection>

                <InlineSection>
                  <Label htmlFor="close_person_phone">Telefon</Label>
                  <FormInputError>
                    <input
                      type="phone"
                      id="close_person_phone"
                      {...register('close_person.phone')}
                    />
                  </FormInputError>
                  <Label htmlFor="close_person_email">E-mail</Label>
                  <FormInputError>
                    <input
                      type="email"
                      id="close_person_email"
                      {...register('close_person.email')}
                    />
                  </FormInputError>
                </InlineSection>
                {questions && (
                  <>
                    <h3>Otazky:</h3>
                    {questions.results.map((question: any, i) => {
                      console.log(question.is_required)

                      return (
                        <>
                          {' '}
                          <p>
                            <Label
                              htmlFor={`answers.${i}`}
                              required={question.is_required ? true : false}
                            >
                              {question.question}
                            </Label>
                          </p>
                          <FullSizeElement>
                            <FormInputError>
                              <textarea
                                id={`answers.${i}`}
                                {...register(`answers.${i}`, {
                                  setValueAs: v => ({
                                    is_required: question?.is_required,
                                    answer: v,
                                    question: { id: question.id },
                                  }),
                                })}
                              />
                            </FormInputError>
                          </FullSizeElement>
                        </>
                      )
                    })}
                  </>
                )}

                <input type="submit" value="Add aplication" />
              </>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  )
}

export default NewApplicationModal
