import { Controller, useForm } from 'react-hook-form'
import { api, OpportunityPayload } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'
import { file2base64 } from '../utils/helpers'

const CreateOpportunity = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()

  const {
    data: opportunityCategories,
    isLoading: isReadingOpportunityCategories,
  } = api.endpoints.readOpportunityCategories.useQuery({
    page: 1,
    pageSize: 1000,
  })

  const categoriesList = opportunityCategories?.results

  const methods = useForm<OpportunityPayload>()
  const { register, handleSubmit, control, watch } = methods

  const handleFormSubmit = handleSubmit(data => {
    const newData = {
      ...data,
      // TODO: pridat pridavani lokace
      location: 1223,
    }
    if (currentUser)
      createOpportunity({ userId: currentUser.id, opportunity: newData })
  })

  const [createOpportunity, { isLoading: isSavingOpportunity }] =
    api.endpoints.createOpportunity.useMutation()

  return (
    <div>
      <div>
        <div>
          <h1>Nova prilezitost</h1>
          <form onSubmit={handleFormSubmit}>
            {categoriesList &&
              categoriesList.map(category => (
                <>
                  <input
                    id={category.slug}
                    type="radio"
                    value={category.id}
                    {...register('category')}
                  />
                  <label htmlFor={category.slug}>{category.name}</label>
                </>
              ))}
            <input type="text" placeholder="name" {...register('name')} />
            <input
              type="text"
              placeholder="description"
              {...register('description')}
            />
            <input type="date" placeholder="start" {...register('start')} />
            <input type="date" placeholder="end" {...register('end')} />
            <input
              type="date"
              placeholder="onWebStart"
              {...register('on_web_start')}
            />
            <input
              type="date"
              placeholder="onWebEnd"
              {...register('on_web_end')}
            />
            <input
              type="text"
              placeholder="location"
              {...register('location')}
            />
            <input
              type="text"
              placeholder="introduction"
              {...register('introduction')}
            />
            <input
              type="text"
              placeholder="personal_benefits"
              {...register('personal_benefits')}
            />
            <input
              type="text"
              placeholder="requirements"
              {...register('requirements')}
            />
            {/* TODO: copied code */}
            <Controller
              name="image"
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
                  {watch('image') ? (
                    <img src={watch('image')} alt="" />
                  ) : (
                    <span>+</span>
                  )}
                </label>
              )}
            />
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateOpportunity
