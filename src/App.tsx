import { Route } from 'react-router-dom'
import { Routes } from './config/sentry'
import Home from './Home'
import Login from './Login'
import ResetPassword from './ResetPassword'
import SendResetPasswordLink from './SendResetPasswordLink'
import AuthenticatedOutlet from './utils/AuthenticatedOutlet'
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
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
