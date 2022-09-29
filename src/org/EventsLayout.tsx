import classNames from 'classnames'
import { NavLink, Outlet } from 'react-router-dom'
import styles from './EventsLayout.module.scss'

const EventsLayout = () => {
  return (
    <div>
      <nav>
        <NavLink
          to="aktualni"
          className={({ isActive }) => classNames(isActive && styles.active)}
        >
          Aktuální akce
        </NavLink>
        <NavLink
          to="vsechny"
          className={({ isActive }) => classNames(isActive && styles.active)}
        >
          Všechny akce
        </NavLink>
        <NavLink
          to="nevyplnene"
          className={({ isActive }) => classNames(isActive && styles.active)}
        >
          Nevyplněné akce
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}

export default EventsLayout
