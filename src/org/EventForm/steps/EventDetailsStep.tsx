import { useEffect } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import { file2base64, getIdsBySlugs } from '../../../utils/helpers'
import { FormShape } from '../../EventForm'

const EventDetailsStep = () => {
  const { register, control, getValues, watch } = useFormContext<FormShape>()
  const { data: categories } = api.endpoints.getEventCategories.useQuery()

  const imageFields = useFieldArray({
    control,
    name: 'images',
  })

  useEffect(() => {
    // when there is no empty image, add empty image (add button)
    if (!getValues('images') || getValues('images').length === 0)
      imageFields.append({ image: '' })
    // when images change, check that there is always one empty
    const subscription = watch((data, { name, type }) => {
      if (
        data.images &&
        data.images.length ===
          data.images.filter(image => Boolean(image && image.image)).length
      )
        imageFields.append({ image: '' })
    })
    //imageFields.append({ image: '' })

    return () => subscription.unsubscribe()
  }, [watch, imageFields, getValues])

  if (!categories) return <>Loading...</>

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
      {/* TODO: code copied from here */}
      <Controller
        name="main_image.image"
        control={control}
        render={({ field }) => (
          <label>
            <input
              style={{ display: 'none' }}
              type="file"
              {...field}
              value=""
              onChange={async e => {
                const file = e.target.files?.[0]
                field.onChange(file ? await file2base64(file) : '')
              }}
            />
            {watch('main_image.image') ? (
              <img src={watch('main_image.image')} alt="" />
            ) : (
              <span>+</span>
            )}
          </label>
        )}
      />
      <div>Fotky k malé ochutnávce</div>
      <ul>
        {imageFields.fields.map((item, index, allItems) => (
          <li key={item.id}>
            <Controller
              name={`images.${index}.image` as const}
              control={control}
              render={({ field }) => (
                <label>
                  <input
                    style={{ display: 'none' }}
                    type="file"
                    {...field}
                    value=""
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      field.onChange(file ? await file2base64(file) : '')
                    }}
                  />
                  {watch(`images.${index}.image`) ? (
                    <img src={watch(`images.${index}.image`)} alt="" />
                  ) : (
                    <span>+</span>
                  )}
                </label>
              )}
            />
            {getValues(`images.${index}.image`) && (
              <button type="button" onClick={() => imageFields.remove(index)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </FormSection>
  )
}

export default EventDetailsStep
