import type { EventContact } from 'app/services/bisTypes'
import spreadsheetTemplate from 'assets/templates/vzor_import-ucastniku-z-jednoduche-prezencky.xlsx'
import classNames from 'classnames'
import {
  Button,
  ExternalButtonLink,
  FormInputError,
  ImportExcelButton,
  InlineSection,
  StyledModal,
} from 'components'
import { get } from 'lodash'
import tableStyles from 'org/components/EventForm/steps/ParticipantsStep.module.scss'
import {
  FormHTMLAttributes,
  TdHTMLAttributes,
  useEffect,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  FieldErrors,
  FieldPath,
  FieldValues,
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
  const {
    control,
    register,
    trigger,
    formState: { errors, isSubmitted },
  } = useFormContext<ParticipantsStepFormShape>()
  const peopleFields = useFieldArray({ control, name: 'record.contacts' })

  const [open, setOpen] = useState(false)
  const [defaultValues, setDefaultValues] = useState<EventContact>()
  const [editPromise, setEditPromise] = useState<{
    resolve: (data: EventContact) => void
    reject: (reason?: any) => void
    promise: Promise<EventContact>
  }>()

  const getModalData = () => {
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

  // register array of contacts
  useEffect(() => {
    register('record.contacts')
  }, [register])

  useEffect(() => {
    if (isSubmitted) trigger('record.contacts')
  }, [isSubmitted, trigger, peopleFields.fields])

  const handleEdit = async (data: EventContact, i: number) => {
    setOpen(true)
    setDefaultValues(data)
    const finalData = await getModalData()
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
        onUpload={data => peopleFields.append(data)}
      >
        Importovat seznam účastníků z excelu
      </ImportExcelButton>{' '}
      <ExternalButtonLink tertiary href={spreadsheetTemplate}>
        (vzor)
      </ExternalButtonLink>
      <SimpleParticipantInput onSubmit={data => peopleFields.prepend(data)} />
      <table className={classNames(tableStyles.table, styles.contactTable)}>
        <thead>
          <tr>
            <th>Jméno</th>
            <th>Příjmení</th>
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
              <TdErr name={`record.contacts.${i}.first_name`} errors={errors}>
                {item.first_name}
              </TdErr>
              <TdErr name={`record.contacts.${i}.last_name`} errors={errors}>
                {item.last_name}
              </TdErr>
              <TdErr name={`record.contacts.${i}.email`} errors={errors}>
                {item.email}
              </TdErr>
              <TdErr name={`record.contacts.${i}.phone`} errors={errors}>
                {item.phone}
              </TdErr>
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
/**
 * table cell capable of displaying error
 */
const TdErr = <T extends FieldValues>({
  name,
  errors,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  errors: FieldErrors<T>
  name: FieldPath<T>
}) => (
  <td className={classNames(get(errors, name) ? styles.error : undefined)}>
    {props.children}
    <div className={styles.errorMessage}>
      {get(errors, name)?.message as string}
    </div>
  </td>
)

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
        <InlineSection>
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
              placeholder="E-mail*"
              {...register('email' as const, {
                required: validationMessages.required,
              })}
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
        </InlineSection>
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
