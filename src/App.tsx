import AuthenticatedOutlet from 'layout/AuthenticatedOutlet'
import MixedOutlet from 'layout/MixedOutlet'
import OrganizerOutlet from 'layout/OrganizerOutlet'
import UnauthenticatedOutlet from 'layout/UnauthenticatedOutlet'
import AdminRedirect from 'pages/AdminRedirect'
import EventRegistration from 'pages/EventRegistration'
import Home from 'pages/Home'
import Login from 'pages/Login'
import NotFound from 'pages/NotFound'
import ResetPassword from 'pages/ResetPassword'
import SendResetPasswordLink from 'pages/SendResetPasswordLink'
import { Route } from 'react-router-dom'
import { Routes } from './config/sentry'
import ActiveEvents from './org/ActiveEvents'
import AllEvents from './org/AllEvents'
import CloseEvent from './org/CloseEvent'
import CreateEvent from './org/CreateEvent'
import CreateOpportunity from './org/CreateOpportunity'
import EditEvent from './org/EditEvent'
import EventsLayout from './org/EventsLayout'
import OrgHome from './org/Home'
import OpportunityList from './org/OpportunityList'
import UnifinishedEvents from './org/UnfinishedEvents'
import UpdateOpportunity from './org/UpdateOpportunity'
import ViewEvent from './org/ViewEvent'
import ViewOpportunity from './org/ViewOpportunity'
import EditProfile from './user/EditProfile'
import ProfileOutlet from './user/ProfileOutlet'
import ViewMyProfile from './user/ViewMyProfile'
import ViewProfile from './user/ViewProfile'

function App() {
  return (
    <Routes>
      <Route element={<MixedOutlet />}>
        <Route
          path="/akce/:eventId/prihlasit"
          element={<EventRegistration />}
        />
      </Route>
      <Route element={<UnauthenticatedOutlet />}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/send-reset-password-link"
          element={<SendResetPasswordLink />}
        />
        <Route path="/reset_password" element={<ResetPassword />} />
      </Route>
      <Route path="/" element={<AuthenticatedOutlet />}>
        <Route path="profil">
          <Route index element={<ViewMyProfile />} />
          <Route path=":userId" element={<ProfileOutlet />}>
            <Route index element={<ViewProfile />} />
            <Route path="upravit" element={<EditProfile />} />
          </Route>
        </Route>
        <Route path="admin/*" element={<AdminRedirect />} />
        <Route index element={<Home />} />
        <Route path="org" element={<OrganizerOutlet />}>
          <Route index element={<OrgHome />} />
          <Route path="akce/vytvorit" element={<CreateEvent />} />
          <Route path="akce/:eventId">
            <Route index element={<ViewEvent />} />
            <Route path="upravit" element={<EditEvent />} />
            <Route path="uzavrit" element={<CloseEvent />} />
          </Route>
          <Route path="akce" element={<EventsLayout />}>
            <Route path="aktualni" element={<ActiveEvents />} />
            <Route path="vsechny" element={<AllEvents />} />
            <Route path="nevyplnene" element={<UnifinishedEvents />} />
          </Route>
          <Route path="prilezitosti/vytvorit" element={<CreateOpportunity />} />
          <Route path="prilezitosti/:opportunityId">
            <Route index element={<ViewOpportunity />} />
            <Route path="upravit" element={<UpdateOpportunity />} />
          </Route>
          <Route path="prilezitosti" element={<OpportunityList />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
