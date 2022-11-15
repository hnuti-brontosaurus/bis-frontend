import { Controller, FormProvider, UseFormReturn } from 'react-hook-form'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import SelectLocation from '../../../components/SelectLocation'
import { required } from '../../../utils/validationMessages'
import { StepShapes } from '../../EventForm'

const LocationStep = ({
  methods,
}: {
  methods: UseFormReturn<StepShapes['location']>
}) => {
  return (
    <FormProvider {...methods}>
      <form>
        <FormSection>
          <FormSubsection header="Lokace" required>
            <FormInputError>
              <Controller
                name="location"
                control={methods.control}
                rules={{ required }}
                render={({ field }) => <SelectLocation {...field} />}
              />
            </FormInputError>
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default LocationStep
