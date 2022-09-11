import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import ResetPassword from './ResetPassword'
import SendResetPasswordLink from './SendResetPasswordLink'
import { PrivateOutlet } from './utils/PrivateOutlet'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/send-reset-password-link"
        element={<SendResetPasswordLink />}
      />
      <Route path="/reset_password" element={<ResetPassword />} />
      <Route path="/" element={<PrivateOutlet />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
