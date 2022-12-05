import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu'
import { FaBars, FaRegUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './app/services/bis'
import logoMini from './assets/logo-mini.png'
import logo from './assets/logo.png'
import styles from './Header.module.scss'
import { useCurrentUser } from './hooks/currentUser'
import { isOrganizer } from './utils/helpers'

const Header = () => {
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
      {isAuthenticated ? (
        <nav>
          <Menu
            menuButton={
              <MenuButton>
                <FaBars fontSize={20} />
              </MenuButton>
            }
          >
            <MenuItem>
              <Link to="/org/akce/vsechny">Organizované akce</Link>
            </MenuItem>
            <MenuItem>
              <Link to="/org/akce/vytvorit">Vytvořit akci</Link>
            </MenuItem>
            <MenuDivider />
            <MenuItem>
              <Link to="/org/prilezitosti">Příležitosti</Link>
            </MenuItem>
            <MenuItem>
              <Link to="/org/prilezitosti/vytvorit">Vytvořit příležitost</Link>
            </MenuItem>
          </Menu>
        </nav>
      ) : null}
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
          <Link to={isOrganizer(user) ? '/org' : ''}>
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
                <div>
                  {user.first_name} {user.last_name}
                </div>
                <FaRegUser fontSize={20} />
              </MenuButton>
            }
          >
            <MenuItem disabled>
              <span>
                {`${user.first_name} ${user.last_name}`}
                <br />
                {user.email}
              </span>
            </MenuItem>
            <MenuItem>
              <Link to={`/profil`}>Můj profil</Link>
            </MenuItem>
            <MenuItem>
              <Link to={`/profil/${user.id}/upravit`}>Upravit profil</Link>
            </MenuItem>
            <MenuItem>
              <button onClick={handleLogout}>Odhlásit se</button>
            </MenuItem>
          </Menu>
        </nav>
      ) : null}
    </div>
  )
}

export default Header
