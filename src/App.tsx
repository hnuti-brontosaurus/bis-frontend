import { Routes } from 'config/sentry'
import { AuthenticatedOutlet } from 'layout/AuthenticatedOutlet'
import { MixedOutlet } from 'layout/MixedOutlet'
import { OrganizerOutlet } from 'layout/OrganizerOutlet'
import { UnauthenticatedOutlet } from 'layout/UnauthenticatedOutlet'
import { EventsLayout } from 'org/EventsLayout'
import { ActiveEvents } from 'org/pages/ActiveEvents'
import { AllEvents } from 'org/pages/AllEvents'
import { CloseEvent } from 'org/pages/CloseEvent'
import { CreateEvent } from 'org/pages/CreateEvent'
import { CreateOpportunity } from 'org/pages/CreateOpportunity'
import { Home as OrgHome } from 'org/pages/Home'
import { OpportunityList } from 'org/pages/OpportunityList/OpportunityList'
import { UnfinishedEvents } from 'org/pages/UnfinishedEvents'
import { UpdateEvent } from 'org/pages/UpdateEvent'
import { UpdateOpportunity } from 'org/pages/UpdateOpportunity'
import { ViewEvent } from 'org/pages/ViewEvent'
import { ViewOpportunity } from 'org/pages/ViewOpportunity'
import { AdminRedirect } from 'pages/AdminRedirect'
import { EventRegistration } from 'pages/EventRegistration'
import { Home } from 'pages/Home'
import { Login } from 'pages/Login'
import { NotFound } from 'pages/NotFound'
import { ResetPassword } from 'pages/ResetPassword'
import { SendResetPasswordLink } from 'pages/SendResetPasswordLink'
import { Route } from 'react-router-dom'
import { EditProfile } from 'user/EditProfile'
import { UserParticipatedEvents } from 'user/pages/UserParticipatedEvents'
import { UserRegisteredEvents } from 'user/pages/UserRegisteredEvents'
import { ProfileOutlet } from 'user/ProfileOutlet'
import { UserEventsLayout } from 'user/UserEventsLayout'
import { ViewMyProfile } from 'user/ViewMyProfile'
import { ViewProfile } from 'user/ViewProfile'

export const App = () => {
  return (
    <Routes>
      {/* Routes for both authenticated and unauthenticated users (e.g. registration for events) */}
      <Route element={<MixedOutlet />}>
        <Route
          path="/akce/:eventId/prihlasit"
          element={<EventRegistration />}
        />
      </Route>
      {/* Routes for unauthenticated users */}
      <Route element={<UnauthenticatedOutlet />}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/send-reset-password-link"
          element={<SendResetPasswordLink />}
        />
        <Route path="/reset_password" element={<ResetPassword />} />
      </Route>
      {/* Routes for authenticated users */}
      <Route path="/" element={<AuthenticatedOutlet />}>
        <Route path="profil">
          <Route index element={<ViewMyProfile />} />
          <Route path=":userId" element={<ProfileOutlet />}>
            <Route index element={<ViewProfile />} />
            <Route path="upravit" element={<EditProfile />} />
          </Route>
        </Route>
        <Route path="akce" element={<UserEventsLayout />}>
          <Route path="zucastnene" element={<UserParticipatedEvents />} />
          <Route path="prihlasene" element={<UserRegisteredEvents />} />
        </Route>
        <Route path="akce/:eventId" element={<ViewEvent readonly />} />
        <Route path="admin/*" element={<AdminRedirect />} />
        <Route index element={<Home />} />
        {/* Routes for organizers */}
        <Route path="org" element={<OrganizerOutlet />}>
          <Route index element={<OrgHome />} />
          <Route path="akce/vytvorit" element={<CreateEvent />} />
          <Route path="akce/:eventId">
            <Route index element={<ViewEvent />} />
            <Route path="upravit" element={<UpdateEvent />} />
            <Route path="uzavrit" element={<CloseEvent />} />
          </Route>
          <Route path="akce" element={<EventsLayout />}>
            <Route path="aktualni" element={<ActiveEvents />} />
            <Route path="vsechny" element={<AllEvents />} />
            <Route path="nevyplnene" element={<UnfinishedEvents />} />
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
