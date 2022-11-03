import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import { FC } from 'react'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { Event } from '../app/services/testApi'

import { useMemo } from 'react'
import { api } from '../app/services/bis'
import { useQueries } from '../hooks/queries'
import { useRemoveEvent } from '../hooks/removeEvent'
import { getEventStatus } from '../utils/helpers'

const EventTable: FC<{
  events: Event[]
}> = ({ events }) => {
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
    <table>
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
                  {status}
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
