import { Error, Loading } from 'components'
import { useReadFullEvent } from 'hooks/readFullEvent'
import { Outlet, useParams } from 'react-router-dom'

export const EventOutlet = () => {
  const params = useParams()
  const eventId = Number(params.eventId)

  const { data: event, isError, error } = useReadFullEvent(eventId)

  if (isError) return <Error error={error}>Nepodařilo se nám najít akci</Error>

  if (!event) return <Loading>Stahujeme akci</Loading>

  return <Outlet context={{ event }} />
}
