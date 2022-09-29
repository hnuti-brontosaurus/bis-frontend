import { Route } from 'react-router-dom'
import AdminRedirect from './AdminRedirect'
import { Routes } from './config/sentry'
import CreateEvent from './CreateEvent'
import Home from './Home'
import Login from './Login'
import NotFound from './NotFound'
import ActiveEvents from './org/ActiveEvents'
import AllEvents from './org/AllEvents'
import EventsLayout from './org/EventsLayout'
import OrgHome from './org/Home'
import UnifinishedEvents from './org/UnfinishedEvents'
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
          <Route path="akce/vytvorit" element={<CreateEvent />} />
          <Route path="akce" element={<EventsLayout />}>
            <Route path="aktualni" element={<ActiveEvents />} />
            <Route path="vsechny" element={<AllEvents />} />
            <Route path="nevyplnene" element={<UnifinishedEvents />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
