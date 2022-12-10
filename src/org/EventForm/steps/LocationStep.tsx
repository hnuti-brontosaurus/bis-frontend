import {
  FormInputError,
  FormSection,
  FormSubsection,
  InlineSection,
  SelectLocation,
} from 'components'
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form'
import { required } from '../../../utils/validationMessages'
import { StepShapes } from '../EventForm'

const formId = 'event-form-location-step'

const LocationStep = ({
  methods,
}: {
  methods: UseFormReturn<StepShapes['location']>
}) => {
  const { watch, register, control } = methods

  return (
    <FormProvider {...methods}>
      <form id={formId} />
      <FormSection startIndex={9}>
        <FormSubsection header="Místo konání" required onWeb>
          <label>
            <input form={formId} type="checkbox" {...register('online')} /> Akce
            se koná online
          </label>
          {watch('online') ? (
            <InlineSection>
              Odkaz na online setkání{' '}
              <FormInputError>
                <input type="url" form={formId} {...register('online_link')} />
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
    </FormProvider>
  )
}

export default LocationStep
