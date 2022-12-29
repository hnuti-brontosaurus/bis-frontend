import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import { api } from 'app/services/bis'
import { Event } from 'app/services/bisTypes'
import classNames from 'classnames'
import styles from 'components/Table.module.scss'
import { useQueries } from 'hooks/queries'
import { useRemoveEvent } from 'hooks/removeEvent'
import { useCancelEvent, useRestoreCanceledEvent } from 'hooks/useCancelEvent'
import { FC, ReactElement, useMemo } from 'react'
import { AiOutlineStop } from 'react-icons/ai'
import { FaPencilAlt, FaRegCheckCircle } from 'react-icons/fa'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import {
  EventStatus,
  formatDateRange,
  getEventStatus,
  isEventClosed,
} from 'utils/helpers'

/**
 * A list of default actions for different event statuses
 */
const appropriateActions: Record<
  EventStatus,
  {
    title: string
    link: (event: Event) => string
    icon: ReactElement
  }
> = {
  draft: {
    title: 'upravit',
    link: event => `/org/akce/${event.id}/upravit`,
    icon: <FaPencilAlt className={styles.draft} />,
  },
  inProgress: {
    title: 'evidence nedokončena (pokračovat v evidenci)',
    link: event => `/org/akce/${event.id}/uzavrit`,
    icon: <FaRegCheckCircle className={styles.inProgress} />,
  },
  finished: {
    title: 'evidence uzavřena (prohlédnout akci)',
    link: event => `/org/akce/${event.id}`,
    icon: <FaRegCheckCircle className={styles.finished} />,
  },
  closed: {
    title: 'akce uzavřena (prohlédnout akci)',
    link: event => `/org/akce/${event.id}`,
    icon: <FaRegCheckCircle className={styles.closed} />,
  },
  canceled: {
    title: 'akce zrušena',
    link: event => `/org/akce/${event.id}`,
    icon: <AiOutlineStop className={styles.canceled} />,
  },
}

export const EventTable: FC<{
  data: Event[]
  action?: 'view' | 'edit' | 'finish'
}> = ({ data: events, action = 'view' }) => {
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
  const [cancelEvent, { isLoading: isEventCanceling }] = useCancelEvent()
  const [restoreCanceledEvent, { isLoading: isEventRestoring }] =
    useRestoreCanceledEvent()

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
          return (
            <tr key={event.id}>
              <td className={styles.cellWithButton}>
                <Link
                  title={appropriateActions[status].title}
                  to={appropriateActions[status].link(event)}
                >
                  {appropriateActions[status].icon}
                </Link>
              </td>
              <td>
                <Link
                  to={
                    `/org/akce/${event.id}` +
                    (action === 'finish' ? '/uzavrit' : '')
                  }
                >
                  {event.name}
                </Link>
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
                        {event.is_canceled ? (
                          <button
                            disabled={isEventRestoring}
                            onClick={() => restoreCanceledEvent(event)}
                          >
                            obnovit
                          </button>
                        ) : (
                          <button
                            disabled={isEventCanceling}
                            onClick={() => cancelEvent(event)}
                          >
                            zrušit
                          </button>
                        )}
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
