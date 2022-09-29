import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import { FaBars, FaRegUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './app/services/bis'
import { User } from './app/services/testApi'
import logo from './assets/logo.png'
import styles from './Header.module.scss'
import { useCurrentUser } from './hooks/currentUser'

const getCurrentRole = (user: User): 'organizer' | 'user' =>
  user.roles.find(role => role.slug === 'organizer') ? 'organizer' : 'user'

const Header = () => {
  const { data: user, isLoading } = useCurrentUser()
  const [logout, { isLoading: isLoggingOut }] =
    api.endpoints.logout.useMutation()

  const navigate = useNavigate()

  if (!user || isLoading) return <div>loading...</div>

  const currentRole = getCurrentRole(user)

  const handleLogout = async () => {
    // logout with endpoint
    await logout().unwrap()
    // remove auth token from local storage and state

    // go to homepage
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <nav>{<FaBars fontSize={20} />}</nav>
      <nav>
        <img src={logo} alt="" className={styles.logo} />
      </nav>
      <div className={styles.spacer}></div>
      <div>
        <Link to={currentRole === 'organizer' ? '/org' : ''}>
          {currentRole === 'organizer' ? 'Organizátor' : 'Uživatel'}
        </Link>
      </div>
      <Menu
        menuButton={
          <MenuButton>
            <div title={`${user.first_name} ${user.last_name}`}>
              <FaRegUser fontSize={20} />
            </div>
          </MenuButton>
        }
      >
        <MenuItem>{`${user.first_name} ${user.last_name}`}</MenuItem>
        <MenuItem>
          <button onClick={handleLogout}>Logout</button>
        </MenuItem>
      </Menu>
    </div>
  )
}

export default Header
