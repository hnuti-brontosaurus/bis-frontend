import { Error, Loading } from 'components'
import { useCurrentUser } from 'hooks/currentUser'
import { Outlet } from 'react-router-dom'
import { isOrganizer } from 'utils/helpers'

export const OrganizerOutlet = () => {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) return <Loading>Ověřujeme Tvé role</Loading>
  if (!user) return <div>This is error, You're a ghost</div>

  return isOrganizer(user) ? (
    <Outlet />
  ) : (
    <Error
      status={403}
      message="Nemáš dostatečná práva k organizátorskému přístupu"
    >
      Nejsi organizátor/ka
    </Error>
  )
}
