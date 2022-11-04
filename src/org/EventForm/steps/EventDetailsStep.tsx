import { useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import { ImagesUpload, ImageUpload } from '../../../components/ImageUpload'
import Loading from '../../../components/Loading'
import { getIdsBySlugs } from '../../../utils/helpers'
import { EventFormShape } from '../../EventForm'

const EventDetailsStep = () => {
  const { register, watch } = useFormContext<EventFormShape>()
  const { data: categories } = api.endpoints.getEventCategories.useQuery()

  if (!categories) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormSection>
      <FormSubsection header="Poznámka" help="asdf">
        <FormInputError>
          <input type="text" {...register('internal_note', {})} />
        </FormInputError>
      </FormSubsection>
      <div>
        Zvací text: Co nás čeká
        <FormInputError>
          <textarea
            {...register('propagation.invitation_text_introduction', {
              required: 'required',
            })}
          />
        </FormInputError>
      </div>
      <div>
        Zvací text: Co, kde a jak
        <FormInputError>
          <textarea
            {...register('propagation.invitation_text_practical_information', {
              required: 'required',
            })}
          />
        </FormInputError>
      </div>
      <div>
        Zvací text: Dobrovolnická pomoc
        <FormInputError>
          <textarea
            {...register('propagation.invitation_text_work_description', {
              required:
                getIdsBySlugs(categories?.results ?? [], [
                  'public__volunteering__only_volunteering',
                  'public__volunteering__with_experience',
                ]).includes(+watch('category')) && 'Toto pole je povinné!',
            })}
          />
        </FormInputError>
      </div>
      <div>
        Zvací text: Malá ochutnávka
        <FormInputError>
          <textarea {...register('propagation.invitation_text_about_us', {})} />
        </FormInputError>
      </div>
      <div>Hlavní foto</div>
      <ImageUpload name="main_image.image" />
      <div>Fotky k malé ochutnávce</div>
      <ImagesUpload name="images" />
    </FormSection>
  )
}

export default EventDetailsStep
