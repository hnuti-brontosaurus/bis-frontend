import { Route } from 'react-router-dom'
import AdminRedirect from './AdminRedirect'
import { Routes } from './config/sentry'
import CreateEvent from './CreateEvent'
import Home from './Home'
import Login from './Login'
import NotFound from './NotFound'
import OrgHome from './OrgHome'
import ResetPassword from './ResetPassword'
import SendResetPasswordLink from './SendResetPasswordLink'
import AuthenticatedOutlet from './utils/AuthenticatedOutlet'
import OrganizerOutlet from './utils/OrganizerOutlet'
import UnauthenticatedOutlet from './utils/UnauthenticatedOutlet'

function App() {
  return (
    <Routes>
      <Route element={<UnauthenticatedOutlet />}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/send-reset-password-link"
          element={<SendResetPasswordLink />}
        />
        <Route path="/reset_password" element={<ResetPassword />} />
      </Route>
      <Route path="/" element={<AuthenticatedOutlet />}>
        <Route path="admin/*" element={<AdminRedirect />} />
        <Route index element={<Home />} />
        <Route path="org" element={<OrganizerOutlet />}>
          <Route index element={<OrgHome />} />
          <Route path="nova-akce" element={<CreateEvent />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
