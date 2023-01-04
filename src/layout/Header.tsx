import { Menu, MenuButton, MenuDivider, MenuItem } from '@szhsin/react-menu'
import { api } from 'app/services/bis'
import logoMini from 'assets/logo-mini.png'
import logo from 'assets/logo.png'
import classNames from 'classnames'
import { useCurrentUser } from 'hooks/currentUser'
import { useAllowedToCreateEvent } from 'hooks/useAllowedToCreateEvent'
import { AiOutlineMenu } from 'react-icons/ai'
import { FaRegUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { isOrganizer } from 'utils/helpers'
import styles from './Header.module.scss'

export const Header = () => {
  const { data: user, isAuthenticated } = useCurrentUser()
  const [logout] = api.endpoints.logout.useMutation()
  const [canAddEvent] = useAllowedToCreateEvent()

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
            className={styles.menuButton}
          >
            {isOrganizer(user) ? 'Organizátor' : 'Uživatel'}
          </Link>
        </nav>
      ) : null}
      {isAuthenticated ? (
        <nav>
          <Menu
            menuButton={({ open }) => (
              <MenuButton
                className={classNames(
                  open && styles.menuButtonOpen,
                  styles.menuButton,
                )}
                title={`Menu`}
              >
                {' '}
                <AiOutlineMenu fontSize={20} />
                <div className={styles.profileName}>Menu</div>
              </MenuButton>
            )}
            align={'end'}
          >
            <MenuItem className={styles.menuItemCustom}>
              <Link to="/org/akce/vsechny">Organizované akce</Link>
            </MenuItem>
            {canAddEvent && (
              <MenuItem className={styles.menuItemCustom}>
                <Link to="/org/akce/vytvorit">Vytvořit akci</Link>
              </MenuItem>
            )}
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
      {user ? (
        <nav>
          <Menu
            menuButton={({ open }) => (
              <MenuButton
                className={classNames(
                  open && styles.menuButtonOpen,
                  styles.menuButton,
                )}
                title={`${user.first_name} ${user.last_name}`}
              >
                {' '}
                <FaRegUser fontSize={18} />
                <div className={styles.profileName}>
                  {user.first_name} {user.last_name}
                </div>
              </MenuButton>
            )}
            align={'end'}
          >
            <MenuItem className={styles.menuItemProfileData}>
              <Link to={`/profil/${user.id}/upravit`}>
                <span className={styles.menuUserInfo}>
                  <span
                    className={styles.menuName}
                  >{`${user.first_name} ${user.last_name}`}</span>
                  <span className={styles.menuEmail}>{user.email}</span>
                </span>
              </Link>
            </MenuItem>
            <MenuDivider />

            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/akce/zucastnene`}>Účast na akcích</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/akce/prihlasene`}>Přihlášení na akce</Link>
            </MenuItem>
            <MenuDivider />
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/profil`}>Můj profil</Link>
            </MenuItem>
            <MenuItem className={styles.menuItemCustom}>
              <Link to={`/profil/${user.id}/upravit`}>Upravit profil</Link>
            </MenuItem>
            <MenuDivider />

            <MenuItem className={styles.menuItemCustom}>
              <button onClick={handleLogout}>Odhlásit se</button>
            </MenuItem>
          </Menu>
        </nav>
      ) : null}
    </div>
  )
}
