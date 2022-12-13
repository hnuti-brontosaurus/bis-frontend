import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import { api } from 'app/services/bis'
import { Event } from 'app/services/bisTypes'
import classNames from 'classnames'
import styles from 'components/Table.module.scss'
import { useQueries } from 'hooks/queries'
import { useRemoveEvent } from 'hooks/removeEvent'
import { FC, useMemo } from 'react'
import { FaRegCheckCircle } from 'react-icons/fa'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { formatDateRange, getEventStatus, isEventClosed } from 'utils/helpers'

export const EventTable: FC<{
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
              <td className={styles.cellWithButton}>
                <Link
                  title={appropriateAction.title}
                  to={appropriateAction.link}
                >
                  {status && <FaRegCheckCircle className={styles[status]} />}
                </Link>
              </td>
              <td>
                <Link to={`/org/akce/${event.id}`}>{event.name}</Link>
              </td>
              <td>{formatDateRange(event.start, event.end)}</td>
              <td>
                {
                  locationRequests.find(
                    request => request.data?.id === event?.location,
                  )?.data?.name
                }
              </td>
              <td className={styles.cellWithButton}>
                <Menu
                  menuButton={
                    <MenuButton>
                      <TbDotsVertical />
                    </MenuButton>
                  }
                  className={styles.buttonInsideCell}
                >
                  {!isEventClosed(event) && (
                    <MenuItem>
                      <Link to={`/org/akce/${event.id}/upravit`}>upravit</Link>
                    </MenuItem>
                  )}
                  <MenuItem>
                    <Link to={`/org/akce/vytvorit?klonovat=${event.id}`}>
                      klonovat
                    </Link>
                  </MenuItem>
                  {!isEventClosed(event) && (
                    <>
                      <MenuItem>
                        <Link to={`/org/akce/${event.id}/uzavrit`}>
                          po akci
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <button
                          disabled={isEventRemoving}
                          onClick={() => removeEvent(event)}
                        >
                          smazat
                        </button>
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}