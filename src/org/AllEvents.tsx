import { skipToken } from '@reduxjs/toolkit/dist/query'
import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import { useMemo } from 'react'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { api } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'
import { useQueries } from '../hooks/queries'

const AllEvents = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()

  const { data: events, isLoading: isEventsLoading } =
    api.endpoints.readOrganizedEvents.useQuery(
      currentUser
        ? { userId: currentUser.id, page: 1, pageSize: 5 }
        : skipToken,
    )

  const locationRequests = useQueries(
    api.endpoints.readLocation,
    useMemo(
      () =>
        events?.results
          ? events.results
              .filter(event => event.location)
              .map(event => ({ id: event.location as number }))
          : [],
      [events],
    ),
  )

  if (isEventsLoading || !events?.results) return <div>Loading...</div>

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
        {events.results.map(event => (
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
              </Menu>{' '}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default AllEvents
