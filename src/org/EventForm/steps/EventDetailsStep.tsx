import { Controller, FormProvider } from 'react-hook-form'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubheader,
  FormSubsection,
  FullSizeElement,
} from '../../../components/FormLayout'
import { ImagesUpload, ImageUpload } from '../../../components/ImageUpload'
import RichTextEditor, {
  htmlRequired,
} from '../../../components/RichTextEditor'
import { required } from '../../../utils/validationMessages'
import { MethodsShapes } from '../../EventForm'

const EventDetailsStep = ({
  methods,
  isVolunteering,
}: {
  methods: MethodsShapes['details']
  isVolunteering: boolean
}) => {
  const { register, control } = methods

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection>
          <FormSubsection header="Poznámka" help="asdf">
            <FormInputError>
              <input type="text" {...register('internal_note', {})} />
            </FormInputError>
          </FormSubsection>
          <FullSizeElement>
            <FormSubheader required>Zvací text: Co nás čeká</FormSubheader>
            <FormInputError isBlock>
              <Controller
                name="propagation.invitation_text_introduction"
                control={control}
                rules={{
                  required,
                  validate: {
                    required: htmlRequired(required),
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor
                    placeholder="propagation.invitation_text_introduction"
                    {...field}
                  />
                )}
              />
            </FormInputError>
          </FullSizeElement>
          <FullSizeElement>
            <FormSubheader required>Zvací text: Co, kde a jak</FormSubheader>
            <FormInputError isBlock>
              <Controller
                name="propagation.invitation_text_practical_information"
                control={control}
                rules={{
                  required,
                  validate: {
                    required: htmlRequired(required),
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor
                    placeholder="propagation.invitation_text_practical_information"
                    {...field}
                  />
                )}
              />
            </FormInputError>
          </FullSizeElement>
          <FullSizeElement>
            <FormSubheader required={isVolunteering}>
              Zvací text: Dobrovolnická pomoc
            </FormSubheader>
            <FormInputError isBlock>
              <Controller
                name="propagation.invitation_text_work_description"
                control={control}
                rules={{
                  required: isVolunteering && required,
                  validate: {
                    required: htmlRequired(isVolunteering && required),
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor
                    placeholder="propagation.invitation_text_work_description"
                    {...field}
                  />
                )}
              />
            </FormInputError>
          </FullSizeElement>
          <FullSizeElement>
            <FormSubheader>Zvací text: Malá ochutnávka</FormSubheader>
            <FormInputError isBlock>
              <Controller
                name="propagation.invitation_text_about_us"
                control={control}
                rules={{}}
                render={({ field }) => (
                  <RichTextEditor
                    placeholder="propagation.invitation_text_about_us"
                    {...field}
                  />
                )}
              />
            </FormInputError>
          </FullSizeElement>
          <div>Hlavní foto</div>
          <ImageUpload name="main_image.image" />
          <div>Fotky k malé ochutnávce</div>
          <ImagesUpload name="images" />
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default EventDetailsStep
