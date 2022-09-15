import * as Sentry from '@sentry/react'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import ResetPassword from './ResetPassword'
import SendResetPasswordLink from './SendResetPasswordLink'
import { PrivateOutlet } from './utils/PrivateOutlet'

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes)

function App() {
  return (
    <SentryRoutes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/send-reset-password-link"
        element={<SendResetPasswordLink />}
      />
      <Route path="/reset_password" element={<ResetPassword />} />
      <Route path="/" element={<PrivateOutlet />}>
        <Route index element={<Home />} />
      </Route>
    </SentryRoutes>
  )
}

export default App
