import { api } from 'app/services/bis'
import { UserPayload } from 'app/services/bisTypes'
import { Actions, Button, LoadingIcon } from 'components'
import { useQueries } from 'hooks/queries'
import { FaTimesCircle, FaUserCheck, FaUserPlus } from 'react-icons/fa'
import type { ValuesType } from 'utility-types'
import styles from './ImportParticipantsList.module.scss'

const getRequestStatus = (
  request: ValuesType<ReturnType<typeof useQueries>>,
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

const statusIcons = {
  pending: <LoadingIcon />,
  found: <FaUserCheck />,
  notFound: <FaUserPlus />,
  error: <FaTimesCircle />,
}

const statusTitles = {
  pending: '',
  found: 'Uživatel/ka existuje',
  notFound: '',
  error: 'Chyba',
}

export type ConfirmedUser =
  | UserPayload
  | ({ id: string } & Partial<UserPayload>)

export const ImportParticipantsList = ({
  data,
  onConfirm,
  onCancel,
}: {
  data: UserPayload[]
  onConfirm: (data: ConfirmedUser[]) => void
  onCancel: () => void
}) => {
  // find out which users exist and which ones don't
  const userRequests = useQueries(api.endpoints.readUserByBirthdate, data)

  const handleConfirm = () => {
    onConfirm(userRequests.map(req => ({ id: req.data!.id })))
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
          {data.map((user, i) => {
            const req = userRequests[i]
            const status = getRequestStatus(req)
            const icon = statusIcons[status]
            const title =
              status === 'error' && req.error && 'message' in req.error
                ? 'Chyba ' + req.error.message
                : statusTitles[status]

            return (
              <tr
                key={
                  user.first_name + user.last_name + user.birthday + user.email
                }
              >
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.birthday}</td>
                <td>
                  <span title={title} aria-label={title}>
                    {icon}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Actions>
        <Button secondary onClick={onCancel}>
          Zrušit
        </Button>
        <Button primary onClick={handleConfirm}>
          Pokračovat
        </Button>
      </Actions>
    </div>
  )
}
