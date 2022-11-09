import { Controller, useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubheader,
  FormSubsection,
  FullSizeElement,
} from '../../../components/FormLayout'
import { ImagesUpload, ImageUpload } from '../../../components/ImageUpload'
import Loading from '../../../components/Loading'
import RichTextEditor, {
  htmlRequired,
} from '../../../components/RichTextEditor'
import { getIdsBySlugs } from '../../../utils/helpers'
import { required } from '../../../utils/validationMessages'
import { EventFormShape } from '../../EventForm'

const EventDetailsStep = () => {
  const { register, watch, control } = useFormContext<EventFormShape>()
  const { data: categories } = api.endpoints.getEventCategories.useQuery()

  if (!categories) return <Loading>Připravujeme formulář</Loading>

  const isVolunteering = getIdsBySlugs(categories?.results ?? [], [
    'public__volunteering__only_volunteering',
    'public__volunteering__with_experience',
  ]).includes(+watch('category'))

  return (
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
  )
}

export default EventDetailsStep
