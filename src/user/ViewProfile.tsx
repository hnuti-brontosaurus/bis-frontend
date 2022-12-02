import { FaPencilAlt } from 'react-icons/fa'
import { useOutletContext } from 'react-router-dom'
import { User } from '../app/services/bisTypes'
import { ButtonLink } from '../components/Button'
import { Actions } from '../components/FormLayout'
import { useCurrentUser } from '../hooks/currentUser'
import { formatDateTime } from '../utils/helpers'
import styles from './ViewProfile.module.scss'

const ViewProfile = () => {
  const { user } = useOutletContext<{ user: User }>()
  const { data: currentUser } = useCurrentUser()
  return (
    <div>
      <header className={styles.header}>
        {currentUser?.id === user.id
          ? 'Můj profil'
          : `Profil uživatele ${user.display_name}`}
      </header>
      <Actions>
        <ButtonLink success to="upravit">
          <FaPencilAlt /> Upravit
        </ButtonLink>
      </Actions>
      <section>
        <table className={styles.horizontalTable}>
          <tbody>
            <tr>
              <th>Jméno</th>
              <td>{user.first_name}</td>
            </tr>
            <tr>
              <th>Příjmení</th>
              <td>{user.last_name}</td>
            </tr>
            <tr>
              <th>Rodné příjmení</th>
              <td>{user.birth_name}</td>
            </tr>
            <tr>
              <th>Přezdívka</th>
              <td>{user.nickname}</td>
            </tr>
            <tr>
              <th>Pohlaví</th>
              <td>{user.sex?.name}</td>
            </tr>
            <tr>
              <th>Datum narození</th>
              <td>{user.birthday ? formatDateTime(user.birthday) : null}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{user.email}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

export default ViewProfile
