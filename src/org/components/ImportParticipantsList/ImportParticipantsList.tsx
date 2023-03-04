import { api } from 'app/services/bis'
import { User, UserPayload } from 'app/services/bisTypes'
import { Actions, Button, LoadingIcon } from 'components'
import { UserForm } from 'components/UserForm/UserForm'
import merge from 'lodash/merge'
import { useEffect, useMemo, useState } from 'react'
import { FaTimesCircle, FaUserCheck, FaUserPlus } from 'react-icons/fa'
import { UserImport } from '../EventForm/steps/registration/Participants'
import { import2payload } from './helpers'
import styles from './ImportParticipantsList.module.scss'

const statusIcons = {
  pending: <LoadingIcon />,
  found: <FaUserCheck />,
  notFound: <FaUserPlus />,
  error: <FaTimesCircle />,
}

const statusTitles = {
  pending: '',
  found: 'Uživatel/ka existuje',
  notFound: 'Uživatel/ka bude vytvořen/a',
  error: 'Chyba',
}

type ProcessedUserWithStatus = { status: unknown; user: ConfirmedUser }

export type ConfirmedUser =
  | UserPayload
  | ({ id: string } & Partial<UserPayload>)

export const ImportParticipantsList = ({
  data: initialData = [],
  onConfirm,
  onCancel,
}: {
  data?: UserImport[]
  onConfirm: (data: ConfirmedUser[]) => void
  onCancel: () => void
}) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1)
  const [processedData, setProcessedData] = useState<ProcessedUserWithStatus[]>(
    [],
  )

  const handleConfirm = () => {
    onConfirm(processedData.map(({ user }) => user))
  }

  const handleUserDataChange = (
    row: number,
    processed: ProcessedUserWithStatus,
  ) => {
    setProcessedData(data => {
      if (data[row] === processed) return data
      const clonedData = [...data]
      clonedData[row] = processed
      return clonedData
    })
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Jméno</td>
            <td>Příjmení</td>
            <td>Datum narození</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {initialData.map((userImport, i) => (
            <RowWithForm
              initialData={userImport}
              expanded={i === selectedRow}
              onToggle={() => setSelectedRow(row => (row === i ? -1 : i))}
              key={`${userImport.first_name}_${userImport.last_name}_${userImport.birthday}_${userImport.email}`}
              onChange={userWithState => handleUserDataChange(i, userWithState)}
            />
          ))}
        </tbody>
      </table>
      <Actions>
        <Button secondary onClick={onCancel}>
          Zrušit
        </Button>
        <Button primary onClick={handleConfirm}>
          Potvrdit
        </Button>
      </Actions>
    </div>
  )
}

const getRequestStatus = (
  request: ReturnType<typeof api.endpoints.readUserByBirthdate.useQuery>,
) => {
  if (request.isLoading || request.isUninitialized) return 'pending'
  if (request.isSuccess) return 'found'
  if (
    request.error &&
    'status' in request.error &&
    request.error.status === 404
  )
    return 'notFound'

  return 'error'
}

type RequestStatus = ReturnType<typeof getRequestStatus>

const RowWithForm = ({
  initialData,
  expanded,
  onToggle,
  onChange,
}: {
  initialData: UserImport
  expanded: boolean
  onToggle: () => void
  onChange: (userWithState: ProcessedUserWithStatus) => void
}) => {
  const request = api.endpoints.readUserByBirthdate.useQuery(initialData)
  const { data: healthInsuranceCompanies } =
    api.endpoints.readHealthInsuranceCompanies.useQuery({})

  // here, we keep current user data
  const [currentData, setCurrentData] = useState<ConfirmedUser>()

  // here, we keep the current request status
  const [status, setStatus] = useState<RequestStatus>('pending')

  // change status when request changes
  useEffect(() => {
    setStatus(getRequestStatus(request))
  }, [request])

  // return data when initial data are provided and when user is fetched
  useEffect(() => {
    const confirmed = import2payload(initialData, {
      healthInsuranceCompanies: healthInsuranceCompanies?.results ?? [],
      loaded: request.data,
    })
    setCurrentData(confirmed)
  }, [healthInsuranceCompanies?.results, initialData, request.data])

  const currentDataWithStatus = useMemo(
    () => (currentData ? { status, user: currentData } : undefined),
    [currentData, status],
  )

  // when current data or status change, let the parent component know
  useEffect(() => {
    if (currentDataWithStatus) {
      onChange(currentDataWithStatus)
    }
  }, [currentData, currentDataWithStatus, onChange])

  const icon = statusIcons[status]
  const title =
    status === 'error' && request.error && 'message' in request.error
      ? 'Chyba ' + request.error.message
      : statusTitles[status]

  // data that are used to initialize form
  const initialFormData = useMemo(
    () =>
      merge({}, currentData, {
        health_insurance_company: currentData?.health_insurance_company
          ? { id: currentData.health_insurance_company }
          : undefined,
      }) as unknown as User,
    [currentData],
  )

  if (!currentData) return null

  const handleFormSubmit = (user: UserPayload, id?: string) => {
    setCurrentData(merge(user, id ? { id } : undefined))
    onToggle()
  }

  return (
    <>
      <tr onClick={onToggle} className={styles.userRow}>
        <td>{currentData.first_name}</td>
        <td>{currentData.last_name}</td>
        <td>{currentData.birthday}</td>
        <td>
          <span title={title} aria-label={title}>
            {icon}
          </span>
        </td>
      </tr>
      {expanded && currentData && (
        <tr>
          <td colSpan={4}>
            <UserForm
              id={
                initialData.first_name +
                initialData.last_name +
                initialData.birthday +
                initialData.email
              }
              initialData={initialFormData}
              validateImmediately
              onSubmit={handleFormSubmit}
              onCancel={onToggle}
            />
          </td>
        </tr>
      )}
    </>
  )
}
