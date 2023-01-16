import { Event } from 'app/services/bisTypes'
import { ReactComponent as Counted } from 'assets/counting.svg'
import { ReactComponent as EmailList } from 'assets/email-list.svg'
import { ReactComponent as FullList } from 'assets/full-list.svg'
import {
  ButtonSelect,
  FormInputError,
  FormSection,
  FormSectionGroup,
  InlineSection,
  Label,
  NumberInput,
} from 'components'
import { ButtonSelectGroup } from 'components/ButtonSelect/ButtonSelect'
import { ParticipantsStep as ParticipantsList } from 'org/components/EventForm/steps/ParticipantsStep'
import { ReactElement, useEffect } from 'react'
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form'
import { Entries } from 'type-fest'
import { required } from 'utils/validationMessages'
import type {
  CloseEventFormShape,
  ParticipantsStepFormShape,
} from './CloseEventForm'
import styles from './ParticipantsStep.module.scss'
import { SimpleParticipants } from './SimpleParticipants'

type ParticipantInputType = CloseEventFormShape['participantInputType']

const optionButtonConfig: Record<
  ParticipantInputType,
  { label: string; icon: ReactElement<any, any> }
> = {
  count: { label: 'Mám jen počet účastníků', icon: <Counted /> },
  'simple-list': {
    label: 'Mám jen jméno + příjmení + email',
    icon: <EmailList />,
  },
  'full-list': { label: 'Mám všechny informace', icon: <FullList /> },
} as const

export const ParticipantsStep = ({
  event,
  areParticipantsRequired,
  methods,
}: {
  event: Event
  areParticipantsRequired: boolean
  methods: UseFormReturn<ParticipantsStepFormShape>
}) => {
  const { register, watch, trigger, formState } = methods

  // list of participants is shown when it's required
  // or when organizers prefer it rather than filling just numbers

  const inputType = watch('participantInputType')

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (formState.isSubmitted && name === 'record.number_of_participants')
        trigger('record.number_of_participants_under_26')
    })
    return () => subscription.unsubscribe()
  }, [formState.isSubmitted, trigger, watch])

  const { control } = methods
  return (
    <FormProvider {...methods}>
      <form>
        {/* orgs should be able to always add people to the participants list
      but when the event group is "other", it's optional, and they must fill number_of_participants instead
      */}
        <FormSectionGroup>
          <FormSection header="Evidence účastníků">
            {!areParticipantsRequired && (
              <FormInputError
                className={styles.inputTypeOptions}
                name="participantInputType"
              >
                <ButtonSelectGroup>
                  {(
                    Object.entries(optionButtonConfig) as Entries<
                      typeof optionButtonConfig
                    >
                  ).map(([value, { label, icon }]) => (
                    <ButtonSelect
                      key={value}
                      id={value}
                      label={label}
                      {...register('participantInputType', {
                        required: 'Vyberte, prosím, jednu z možností',
                      })}
                      value={value}
                      icon={icon}
                    />
                  ))}
                </ButtonSelectGroup>
              </FormInputError>
            )}
            <div className={styles.tabFrame}>
              {!areParticipantsRequired &&
                (inputType === 'count' || inputType === 'simple-list') && (
                  <>
                    <InlineSection>
                      <Label required>
                        Počet účastníků celkem (včetně organizátorů)
                      </Label>
                      <FormInputError>
                        <Controller
                          control={control}
                          name="record.number_of_participants"
                          rules={{
                            required,
                            min: {
                              value: 0,
                              message: 'Hodnota musí být větší nebo rovna 0',
                            },
                          }}
                          render={({ field }) => (
                            <NumberInput
                              {...field}
                              min={0}
                              name="record.number_of_participants"
                            ></NumberInput>
                          )}
                        />
                      </FormInputError>
                    </InlineSection>
                    <InlineSection>
                      <Label required>
                        Z toho počet účastníků do 26 let (včetně organizátorů)
                      </Label>
                      <FormInputError>
                        <Controller
                          control={control}
                          name="record.number_of_participants_under_26"
                          rules={{
                            required,
                            min: {
                              value: 0,
                              message: 'Hodnota musí být větší nebo rovna 0',
                            },
                            validate: {
                              lessThanParticipants: value => {
                                const numberOfParticipants = Number(
                                  watch('record.number_of_participants'),
                                )
                                const numberOfParticipantsUnder26 =
                                  Number(value)

                                return (
                                  (!isNaN(numberOfParticipantsUnder26) &&
                                    !isNaN(numberOfParticipants) &&
                                    numberOfParticipantsUnder26 <=
                                      numberOfParticipants) ||
                                  'Hodnota nesmí být větší než počet účastníků celkem'
                                )
                              },
                            },
                          }}
                          render={({ field }) => (
                            <NumberInput
                              {...field}
                              min={0}
                              name="record.number_of_participants_under_26"
                            ></NumberInput>
                          )}
                        />
                      </FormInputError>
                    </InlineSection>
                  </>
                )}
              {!areParticipantsRequired && inputType === 'simple-list' && (
                <SimpleParticipants />
              )}
              {(areParticipantsRequired || inputType === 'full-list') && (
                <ParticipantsList eventId={event.id} eventName={event.name} />
              )}
            </div>
          </FormSection>
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
