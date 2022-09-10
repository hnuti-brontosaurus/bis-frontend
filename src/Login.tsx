import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './app/services/bis'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [login] = api.endpoints.login.useMutation()
  const navigate = useNavigate()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()
    try {
      await login({ email, password }).unwrap()
      navigate('/')
    } catch {
      console.log('error logging in')
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input type="submit" value="Login" />
      </form>
    </div>
  )
}

export default Login
