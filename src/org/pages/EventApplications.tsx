import { Breadcrumbs } from 'components'
import { FullEvent } from 'hooks/readFullEvent'
import { ParticipantsStep } from 'org/components/EventForm/steps/ParticipantsStep'
import { useOutletContext } from 'react-router-dom'

export const EventApplications = () => {
  const { event } = useOutletContext<{ event: FullEvent }>()
  return (
    <>
      <Breadcrumbs eventName={event.name} />
      <ParticipantsStep
        eventId={event.id}
        eventName={event.name}
        onlyApplications
      />
    </>
  )
}
