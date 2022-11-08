import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '../app/services/bis'
import { User } from '../app/services/testApi'
import modalStyles from './NewApplicationModal.module.scss'

interface INewApplicationModalProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  data: { id?: number }
}

const NewApplicationModal: FC<INewApplicationModalProps> = ({
  open,
  onClose,
  onSubmit,
  data: parentData,
}) => {
  const methods = useForm<User>()
  const { register, handleSubmit, control, watch } = methods

  const [createEventApplication, { isLoading: isSavingOpportunity }] =
    api.endpoints.createEventApplication.useMutation()

  const handleFormSubmit = handleSubmit(data => {
    if (parentData?.id) {
      createEventApplication({ user: data, eventId: parentData?.id })
    }
  })
  if (!open) return null

  return (
    <div onClick={onClose} className={modalStyles.overlay}>
      <div
        onClick={e => {
          e.stopPropagation()
        }}
        className={modalStyles.modalContainer}
      >
        <div>
          <div>Pridat Noveho prihlaseneho</div>
          <div>{/* <input type="checkbox"></input>je to dite */}</div>
        </div>
        <div>
          <form onSubmit={handleFormSubmit}>
            <label>
              Jmeno*:
              {/* <input type="text"></input> */}
              <input id="first_name" type="text" {...register('first_name')} />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input id="last_name" type="text" {...register('last_name')} />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input id="email" type="text" {...register('email')} />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input
                id="close_person_email"
                type="text"
                {...register('close_person.email')}
              />
            </label>
            Close person:
            <label>
              Jmeno*:
              {/* <input type="text"></input> */}
              <input
                id="close_person_first_name"
                type="text"
                {...register('close_person.first_name')}
              />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input
                id="close_person_first_name"
                type="text"
                {...register('close_person.last_name')}
              />
            </label>
            Address
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input
                id="address_street"
                type="text"
                {...register('address.street')}
              />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input
                id="address_city"
                type="text"
                {...register('address.city')}
              />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input
                id="address_zip_code"
                type="text"
                {...register('address.zip_code')}
              />
            </label>
            <label>
              Prijmeni*:
              {/* <input type="text"></input> */}
              <input
                id="address_region"
                type="text"
                {...register('address.region')}
              />
            </label>
            <div>{/* <button onClick={onClose}>Cancel</button> */}</div>
            <input type="submit" value="Add aplication" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewApplicationModal
