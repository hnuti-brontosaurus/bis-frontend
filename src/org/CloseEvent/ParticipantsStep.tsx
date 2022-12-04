import { FormProvider, UseFormReturn } from 'react-hook-form'
import { Event } from '../../app/services/bisTypes'
import { Button } from '../../components/Button'
import FormInputError from '../../components/FormInputError'
import {
  Actions,
  FormSection,
  FormSubsection,
  InlineSection,
  Label,
} from '../../components/FormLayout'
import { required } from '../../utils/validationMessages'
import ParticipantsList from '../EventForm/steps/ParticipantsStep'
import { ParticipantsStepFormShape } from './CloseEventForm'

const ParticipantsStep = ({
  event,
  areParticipantsRequired,
  methods,
}: {
  event: Event
  areParticipantsRequired: boolean
  methods: UseFormReturn<ParticipantsStepFormShape>
}) => {
  const { register, watch, setValue } = methods

  // list of participants is shown when it's required
  // or when organizers prefer it rather than filling just numbers
  const isList = areParticipantsRequired || watch('includeList')

  return (
    <FormProvider {...methods}>
      <form>
        {/* orgs should be able to always add people to the participants list
      but when the event group is "other", it's optional, and they must fill number_of_participants instead
      */}
        <FormSection>
          <FormSubsection header="Evidence účastníků">
            {!isList && (
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
            {!areParticipantsRequired && (
              <Actions>
                {watch('includeList') ? (
                  <Button
                    success
                    type="button"
                    onClick={() => {
                      setValue('includeList', false)
                    }}
                  >
                    Vyplnit jen počet účastníků
                  </Button>
                ) : (
                  <Button
                    success
                    type="button"
                    onClick={() => {
                      setValue('includeList', true)
                    }}
                  >
                    Vyplnit místo počtu účastníků seznam účastníků
                  </Button>
                )}
              </Actions>
            )}
            {isList && (
              <ParticipantsList eventId={event.id} eventName={event.name} />
            )}
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default ParticipantsStep
