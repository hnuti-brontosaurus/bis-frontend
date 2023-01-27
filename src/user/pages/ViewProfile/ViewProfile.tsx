import { User } from 'app/services/bisTypes'
import {
  Actions,
  Breadcrumbs,
  ButtonLink,
  DataView,
  ExternalButtonLink,
  PageHeader,
} from 'components'
import * as combinedTranslations from 'config/static/combinedTranslations'
import { useCurrentUser } from 'hooks/currentUser'
import { useTitle } from 'hooks/title'
import { FaPencilAlt } from 'react-icons/fa'
import { useOutletContext } from 'react-router-dom'
import { formatDateTime } from 'utils/helpers'
import styles from './ViewProfile.module.scss'

export const ViewProfile = () => {
  const { user } = useOutletContext<{ user: User }>()
  const { data: currentUser } = useCurrentUser()

  const title =
    currentUser?.id === user.id
      ? 'Můj profil'
      : `Profil uživatele ${user.display_name}`

  useTitle(title)

  return (
    <>
      <Breadcrumbs userName={user.display_name} />
      <div className={styles.pageContainer}>
        <PageHeader>{title}</PageHeader>
        <Actions>
          <ButtonLink primary to="upravit">
            <FaPencilAlt /> Upravit
          </ButtonLink>
          {user.id === currentUser?.id && (
            <ExternalButtonLink
              secondary
              target="_blank"
              rel="noopener noreferrer"
              href="https://forms.gle/gPUL3CgSeAHtNVuu8"
            >
              Zažádat o EYCA/HB kartu
            </ExternalButtonLink>
          )}
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
        {/* <pre className={styles.data}>{JSON.stringify(user, null, 2)}</pre> */}
        <DataView
          data={user}
          translations={combinedTranslations.user}
          genericTranslations={combinedTranslations.generic}
        />
      </div>
    </>
  )
}
