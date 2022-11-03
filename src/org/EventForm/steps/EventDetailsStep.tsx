import { useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import { ImagesUpload, ImageUpload } from '../../../components/ImageUpload'
import { getIdsBySlugs } from '../../../utils/helpers'
import { EventFormShape } from '../../EventForm'

const EventDetailsStep = () => {
  const { register, control, getValues, watch } =
    useFormContext<EventFormShape>()
  const { data: categories } = api.endpoints.getEventCategories.useQuery()

  // const imageFields = useFieldArray({
  //   control,
  //   name: 'images',
  // })

  // useEffect(() => {
  //   // when there is no empty image, add empty image (add button)
  //   if (!getValues('images') || getValues('images').length === 0)
  //     imageFields.append({ image: '' })
  //   // when images change, check that there is always one empty
  //   const subscription = watch((data, { name, type }) => {
  //     if (
  //       data.images &&
  //       data.images.length ===
  //         data.images.filter(image => Boolean(image && image.image)).length
  //     )
  //       imageFields.append({ image: '' })
  //   })
  //   //imageFields.append({ image: '' })

  //   return () => subscription.unsubscribe()
  // }, [watch, imageFields, getValues])

  if (!categories) return <>Loading...</>

  console.log(watch())

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
