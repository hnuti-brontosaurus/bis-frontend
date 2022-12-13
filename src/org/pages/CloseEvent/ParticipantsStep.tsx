import { Event } from 'app/services/bisTypes'
import {
  ButtonSelect,
  FormInputError,
  FormSection,
  FormSubsection,
  InlineSection,
  Label,
} from 'components'
import { ButtonSelectGroup } from 'components/ButtonSelect/ButtonSelect'
import { ParticipantsStep as ParticipantsList } from 'org/components/EventForm/steps/ParticipantsStep'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { Entries } from 'type-fest'
import { required } from 'utils/validationMessages'
import type {
  CloseEventFormShape,
  ParticipantsStepFormShape,
} from './CloseEventForm'
import styles from './ParticipantStep.module.scss'

type ParticipantInputType = CloseEventFormShape['participantInputType']

const optionButtonConfig: Record<ParticipantInputType, string> = {
  count: 'Mám jen počet účastníků',
  'simple-list': 'Mám jen jméno + příjmení + email',
  'full-list': 'Mám všechny informace',
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
  const { register, watch } = methods

  // list of participants is shown when it's required
  // or when organizers prefer it rather than filling just numbers

  const inputType = watch('participantInputType')

  return (
    <FormProvider {...methods}>
      <form>
        {/* orgs should be able to always add people to the participants list
      but when the event group is "other", it's optional, and they must fill number_of_participants instead
      */}
        <FormSection>
          <FormSubsection header="Evidence účastníků">
            {!areParticipantsRequired && (
              <FormInputError
                isBlock
                className={styles.inputTypeOptions}
                name="participantInputType"
              >
                <ButtonSelectGroup>
                  {(
                    Object.entries(optionButtonConfig) as Entries<
                      typeof optionButtonConfig
                    >
                  ).map(([value, label]) => (
                    <ButtonSelect
                      key={value}
                      id={value}
                      label={label}
                      {...register('participantInputType', {
                        required: 'Vyberte, prosím, jednu z možností',
                      })}
                      value={value}
                    />
                  ))}
                </ButtonSelectGroup>
              </FormInputError>
            )}
            {!areParticipantsRequired &&
              (inputType === 'count' || inputType === 'simple-list') && (
                <>
                  <InlineSection>
                    <Label required>Počet účastníků celkem</Label>
                    <FormInputError>
                      <input
                        type="number"
                        min={0}
                        placeholder="number_of_participants"
                        {...register('record.number_of_participants', {
                          required,
                          min: {
                            value: 0,
                            message: 'TODO message >=0',
                          },
                        })}
                      />
                    </FormInputError>
                  </InlineSection>
                  <InlineSection>
                    <Label required>Z toho počet účastníků do 26 let</Label>
                    <FormInputError>
                      <input
                        type="number"
                        min={0}
                        placeholder="number_of_participants_under_26"
                        {...register('record.number_of_participants_under_26', {
                          required,
                          min: {
                            value: 0,
                            message: 'TODO message >=0',
                          },
                        })}
                      />
                    </FormInputError>
                  </InlineSection>
                </>
              )}
            {!areParticipantsRequired && inputType === 'simple-list' && (
              <div>
                TODO: Tady bude rozhraní pro jednoduché přidávání účastníků
              </div>
            )}
            {(areParticipantsRequired || inputType === 'full-list') && (
              <ParticipantsList eventId={event.id} eventName={event.name} />
            )}
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}
