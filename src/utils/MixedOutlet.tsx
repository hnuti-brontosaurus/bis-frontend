import { Outlet } from 'react-router-dom'
import MixedLayout from '../MixedLayout'

const MixedOutlet = () => {
  return (
    <MixedLayout>
      <Outlet />
    </MixedLayout>
  )
}

export default MixedOutlet
