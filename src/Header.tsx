import { FaBars, FaRegUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { User } from './app/services/testApi'
import logo from './assets/logo.png'
import styles from './Header.module.scss'
import { useCurrentUser } from './hooks/currentUser'

const getCurrentRole = (user: User): 'organizer' | 'user' =>
  user.roles.find(role => role.slug === 'organizer') ? 'organizer' : 'user'

const Header = () => {
  const { data: user, isLoading } = useCurrentUser()

  if (!user || isLoading) return <div>loading...</div>

  const currentRole = getCurrentRole(user)

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
      <div title={`${user.first_name} ${user.last_name}`}>
        <FaRegUser fontSize={20} />
      </div>
    </div>
  )
}

export default Header
