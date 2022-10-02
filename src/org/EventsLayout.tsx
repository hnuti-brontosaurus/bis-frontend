import { skipToken } from '@reduxjs/toolkit/dist/query'
import classNames from 'classnames'
import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'
import styles from './EventsLayout.module.scss'

const EventsLayout = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()

  const { data: events, isLoading: isEventsLoading } =
    api.endpoints.readOrganizedEvents.useQuery(
      currentUser
        ? { userId: currentUser.id, page: 1, pageSize: 10000 } // fetch all and don't worry about it anymore
        : skipToken,
    )
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

      {events?.results ? <Outlet context={events} /> : <>Loading...</>}
    </div>
  )
}

export default EventsLayout
