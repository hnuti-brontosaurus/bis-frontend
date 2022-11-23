import { Controller, FormProvider, UseFormReturn } from 'react-hook-form'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubsection,
  InlineSection,
} from '../../../components/FormLayout'
import SelectLocation from '../../../components/SelectLocation'
import { required } from '../../../utils/validationMessages'
import { StepShapes } from '../../EventForm'

const LocationStep = ({
  methods,
}: {
  methods: UseFormReturn<StepShapes['location']>
}) => {
  const { watch, register, control } = methods

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection startIndex={9}>
          <FormSubsection header="Místo konání" required onWeb>
            <label>
              <input type="checkbox" {...register('online')} /> Akce se koná
              online
            </label>
            {watch('online') ? (
              <InlineSection>
                Odkaz na online setkání{' '}
                <FormInputError>
                  <input
                    type="url"
                    {...register('online_link', { required })}
                  />
                </FormInputError>
              </InlineSection>
            ) : (
              <FormInputError>
                <Controller
                  name="location"
                  control={control}
                  rules={{ required }}
                  render={({ field }) => <SelectLocation {...field} />}
                />
              </FormInputError>
            )}
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default LocationStep
