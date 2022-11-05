import { FormProvider, UseFormReturn } from 'react-hook-form'
import FormInputError from '../../components/FormInputError'
import { ParticipantsStepFormShape } from './CloseEventForm'

const ParticipantsStep = ({
  areParticipantsRequired,
  methods,
}: {
  areParticipantsRequired: boolean
  methods: UseFormReturn<ParticipantsStepFormShape>
}) => {
  return (
    <FormProvider {...methods}>
      <form>
        {/* orgs should be able to always add people to the participants list
      but when the event group is "other", it's optional, and they must fill number_of_participants instead
      */}
        <>
          Participants List here (TODO, figure out the actual flow - always
          show, or only sometimes?)
        </>
        {!areParticipantsRequired && (
          <>
            <FormInputError>
              <input
                type="number"
                min={0}
                placeholder="number_of_participants"
                {...methods.register('record.number_of_participants', {
                  required:
                    !areParticipantsRequired && 'toto pole povinné TODO',
                  min: {
                    value: 0,
                    message: 'TODO message >=0',
                  },
                })}
              />
            </FormInputError>
            <FormInputError>
              <input
                type="number"
                min={0}
                placeholder="number_of_participants_under_26"
                {...methods.register('record.number_of_participants_under_26', {
                  required: 'TODO error message required',
                  min: {
                    value: 0,
                    message: 'TODO message >=0',
                  },
                })}
              />
            </FormInputError>
          </>
        )}
        <button type="button">Add participants list?</button>
      </form>
    </FormProvider>
  )
}

export default ParticipantsStep
