import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './Login'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/login')
  }, [])

  return (
    <Routes>
      <Route path="login" element={<Login />} />
    </Routes>
  )
}

export default App
