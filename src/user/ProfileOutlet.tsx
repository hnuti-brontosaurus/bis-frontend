import { Outlet, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import Error from '../components/Error'
import Loading from '../components/Loading'

const ProfileOutlet = () => {
  const params = useParams()
  const userId = params.userId as string

  const {
    data: user,
    isError,
    error,
  } = api.endpoints.getUser.useQuery({ id: userId })

  if (isError) return <Error error={error}></Error>

  if (!user) return <Loading>Připravujeme data</Loading>

  return <Outlet context={{ user }} />
}

export default ProfileOutlet
