import { Route, Routes } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import { PrivateOutlet } from './utils/PrivateOutlet'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateOutlet />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
