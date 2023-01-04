import type { EventContact } from 'app/services/bisTypes'
import classNames from 'classnames'
import {
  Button,
  FormInputError,
  ImportExcelButton,
  StyledModal,
} from 'components'
import tableStyles from 'org/components/EventForm/steps/ParticipantsStep.module.scss'
import { FormHTMLAttributes, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { FaCheck, FaPencilAlt, FaTrash } from 'react-icons/fa'
import * as validationMessages from 'utils/validationMessages'
import type { ParticipantsStepFormShape } from './CloseEventForm'
import styles from './SimpleParticipants.module.scss'

const importMap = {
  first_name: ['jméno', 'first-name', 'first_name', 'given_name'],
  last_name: ['příjmení', 'last-name', 'last_name', 'family_name'],
  email: ['email', 'e-mail', 'mail'],
  phone: ['telefon', 'phone', 'mobil'],
}

export const SimpleParticipants = () => {
  const { control } = useFormContext<ParticipantsStepFormShape>()
  const peopleFields = useFieldArray({ control, name: 'record.contacts' })

  const [open, setOpen] = useState(false)
  const [defaultValues, setDefaultValues] = useState<EventContact>()
  const [editPromise, setEditPromise] = useState<{
    resolve: (data: EventContact) => void
    reject: (reason?: any) => void
    promise: Promise<EventContact>
  }>()

  const getModalData = (data: EventContact) => {
    let res = undefined
    let rej = undefined

    const promise = new Promise<EventContact>((resolve, reject) => {
      res = resolve
      rej = reject
    })

    const p = {
      promise,
      resolve: res as any,
      reject: rej as any,
    }

    setEditPromise(p)

    return promise
  }

  const handleEdit = async (data: EventContact, i: number) => {
    setOpen(true)
    setDefaultValues(data)
    const finalData = await getModalData(data)
    peopleFields.update(i, finalData)
  }

  const handleFinishEdit = (data: EventContact) => {
    if (editPromise?.resolve) editPromise.resolve(data)
  }

  return (
    <div className={styles.container}>
      <StyledModal
        title="Upravit účastníka"
        open={open}
        onClose={() => setOpen(false)}
      >
        <SimpleParticipantInput
          formId="edit-participant-input"
          defaultValues={defaultValues}
          onSubmit={data => {
            handleFinishEdit(data)
            setOpen(false)
          }}
        />
      </StyledModal>
      <header>Jednoduchý seznam účastníků</header>
      <ImportExcelButton<EventContact>
        keyMap={importMap}
        onUpload={data => {
          peopleFields.append(data)
        }}
      >
        Importovat seznam účastníků z excelu
      </ImportExcelButton>
      <SimpleParticipantInput onSubmit={data => peopleFields.prepend(data)} />
      <table className={classNames(tableStyles.table, styles.phoneTable)}>
        <thead>
          <tr>
            <th>Jméno</th>
            <th>E-mail</th>
            <th>Telefon</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {peopleFields.fields.map((item, i) => (
            <tr
              key={item.id}
              title={`${item.first_name || '?'} ${item.last_name || '?'}, ${
                item.email || '—'
              }, ${item.phone || '—'}`}
            >
              <td>{item.first_name + ' ' + item.last_name}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td>
                <Button type="button" onClick={() => handleEdit(item, i)}>
                  <FaPencilAlt />
                </Button>
              </td>
              <td>
                <Button type="button" onClick={() => peopleFields.remove(i)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SimpleParticipantInput = ({
  formId = 'simple-participant-form',
  defaultValues,
  onSubmit,
}: {
  formId?: string
  defaultValues?: EventContact
  onSubmit: (value: EventContact) => void
}) => {
  const methods = useForm<EventContact>({ defaultValues })
  const { register, handleSubmit, reset, setFocus } = methods

  // change default values
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset, setFocus])

  const handleFormSubmit = handleSubmit(data => {
    onSubmit(data)
    setFocus('first_name')
    reset({ first_name: '', last_name: '', email: '', phone: '' })
  })

  return (
    <div>
      <FormProvider {...methods}>
        <OutsideForm id={formId} onSubmit={handleFormSubmit} />
        <FormInputError>
          <input
            form={formId}
            type="text"
            placeholder="Jméno*"
            {...register('first_name', {
              required: validationMessages.required,
            })}
          />
        </FormInputError>
        <FormInputError>
          <input
            form={formId}
            type="text"
            placeholder="Příjmení*"
            {...register('last_name' as const, {
              required: validationMessages.required,
            })}
          />
        </FormInputError>
        <FormInputError>
          <input
            form={formId}
            type="email"
            placeholder="E-mail"
            {...register('email' as const)}
          />
        </FormInputError>
        <FormInputError>
          <input
            form={formId}
            type="tel"
            placeholder="Telefon"
            {...register('phone' as const)}
          />
        </FormInputError>
        <Button primary type="submit" form={formId}>
          <FaCheck />
        </Button>
      </FormProvider>
    </div>
  )
}

const OutsideForm = ({
  containerId = 'root',
  ...props
}: FormHTMLAttributes<HTMLFormElement> & { containerId?: string }) => {
  const container = document.getElementById(containerId)
  const el = document.createElement('div')

  useEffect(() => {
    if (container) {
      container.appendChild(el)
      return () => {
        container.removeChild(el)
      }
    }
  }, [container, el])

  return createPortal(<form {...props} />, el)
}
