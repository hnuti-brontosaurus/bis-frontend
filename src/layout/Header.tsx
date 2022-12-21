import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu'
import { api } from 'app/services/bis'
import logoMini from 'assets/logo-mini.png'
import logo from 'assets/logo.png'
import { useCurrentUser } from 'hooks/currentUser'
import { FaBars, FaRegUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { isOrganizer } from 'utils/helpers'
import styles from './Header.module.scss'

export const Header = () => {
  const { data: user, isAuthenticated } = useCurrentUser()
  const [logout] = api.endpoints.logout.useMutation()

  const navigate = useNavigate()

  const handleLogout = async () => {
    // logout with endpoint
    await logout().unwrap()
    // remove auth token from local storage and state

    // go to homepage
    navigate('/')
    // and hard redirect to cleanup the state and whatnot
    // globalThis.location.href = '/'
  }

  return (
    <div className={styles.container}>
      <nav className={styles.logoWrapper}>
        <Link to="/" title="Domů">
          <img className={styles.logo} src={logo} alt="Brontosaurus logo" />
          <img
            className={styles.logoMini}
            src={logoMini}
            alt="Brontosaurus logo"
          />
        </Link>
      </nav>
      <div className={styles.spacer}></div>
      {user ? (
        <nav>
          <Link
            to={isOrganizer(user) ? '/org' : ''}
            className={styles.roleButton}
          >
            {isOrganizer(user) ? 'Organizátor' : 'Uživatel'}
          </Link>
        </nav>
      ) : null}
      {user ? (
        <nav>
          <Menu
            menuButton={
              <MenuButton
                className={styles.userButton}
                title={`${user.first_name} ${user.last_name}`}
              >
                {' '}
                <FaRegUser fontSize={20} />
                <div>
                  {user.first_name} {user.last_name}
                </div>
              </MenuButton>
            }
            align={'end'}
          >
            <MenuItem className={styles.menuItemReadonly} disabled>
              <span className={styles.menuUserInfo}>
                <span
                  className={styles.menuName}
                >{`${user.first_name} ${user.last_name}`}</span>
                <span className={styles.menuEmail}>{user.email}</span>
              </span>
            </MenuItem>
            <MenuDivider />
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/profil`}>Můj profil</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/profil/${user.id}/upravit`}>Upravit profil</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/akce/zucastnene`}>Účast na akcích</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/akce/prihlasene`}>Přihlášení na akce</Link>
            </MenuItem>
            <MenuDivider />

            <MenuItem className={styles.menuItemCustom}>
              <button onClick={handleLogout}>Odhlásit se</button>
            </MenuItem>
          </Menu>
        </nav>
      ) : null}
      {isAuthenticated ? (
        <nav>
          <Menu
            menuButton={
              <MenuButton>
                <FaBars fontSize={20} />
              </MenuButton>
            }
            align={'end'}
          >
            <MenuItem className={styles.menuItemCustom}>
              <Link to="/org/akce/vsechny">Organizované akce</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to="/org/akce/vytvorit">Vytvořit akci</Link>
            </MenuItem>
            <MenuDivider />
            <MenuItem className={styles.menuItemCustom}>
              <Link to="/org/prilezitosti">Příležitosti</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to="/org/prilezitosti/vytvorit">Vytvořit příležitost</Link>
            </MenuItem>
          </Menu>
        </nav>
      ) : null}
    </div>
  )
}
