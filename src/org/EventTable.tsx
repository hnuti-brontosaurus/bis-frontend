import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import { FC } from 'react'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { Event } from '../app/services/testApi'

import { useMemo } from 'react'
import { api } from '../app/services/bis'
import { useQueries } from '../hooks/queries'

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
        {events.map(event => (
          <tr key={event.id}>
            <td></td>
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
                <MenuItem>smazat</MenuItem>
              </Menu>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default EventTable
