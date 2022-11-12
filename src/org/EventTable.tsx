import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import classNames from 'classnames'
import { FC, useMemo } from 'react'
import { FaRegCheckCircle } from 'react-icons/fa'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { api } from '../app/services/bis'
import { Event } from '../app/services/testApi'
import styles from '../components/Table.module.scss'
import { useQueries } from '../hooks/queries'
import { useRemoveEvent } from '../hooks/removeEvent'
import { getEventStatus } from '../utils/helpers'

const EventTable: FC<{
  data: Event[]
}> = ({ data: events }) => {
  const locationRequests = useQueries(
    api.endpoints.readLocation,
    useMemo(
      () =>
        events
          .filter(event => event.location)
          .map(event => ({ id: event.location as number })),
      [events],
    ),
  )

  const [removeEvent, { isLoading: isEventRemoving }] = useRemoveEvent()

  return (
    <table className={classNames(styles.table, styles.verticalLine1)}>
      <thead>
        <tr>
          <th>Status</th>
          <th>Název</th>
          <th>Termín</th>
          <th>Lokalita</th>
          <th>Typ</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {events.map(event => {
          const status = getEventStatus(event)
          const appropriateAction = {
            title:
              status === 'draft'
                ? 'upravit'
                : status === 'inProgress'
                ? 'upravit record'
                : 'prohlédnout akci',
            link:
              status === 'draft'
                ? `/org/akce/${event.id}/upravit`
                : status === 'inProgress'
                ? `/org/akce/${event.id}/uzavrit`
                : `/org/akce/${event.id}`,
          }
          return (
            <tr key={event.id}>
              <td>
                <Link
                  title={appropriateAction.title}
                  to={appropriateAction.link}
                >
                  {status && <FaRegCheckCircle className={styles[status]} />}
                </Link>
              </td>
              <td>{event.name}</td>
              <td>
                {new Date(event.start).toLocaleDateString('cs')} -{' '}
                {new Date(event.end).toLocaleDateString('cs')}
              </td>
              <td>
                {
                  locationRequests.find(
                    request => request.data?.id === event?.location,
                  )?.data?.name
                }
              </td>
              <td>{event.category.name}</td>
              <td>
                <Menu
                  menuButton={
                    <MenuButton>
                      <TbDotsVertical />
                    </MenuButton>
                  }
                >
                  <MenuItem>
                    <Link to={`/org/akce/${event.id}/upravit`}>upravit</Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to={`/org/akce/vytvorit?klonovat=${event.id}`}>
                      klonovat
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to={`/org/akce/${event.id}/uzavrit`}>uzavřít</Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      disabled={isEventRemoving}
                      onClick={() => removeEvent(event)}
                    >
                      smazat
                    </button>
                  </MenuItem>
                </Menu>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default EventTable
