import { FormEventHandler, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './app/services/bis'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [login, { isLoading: isLoginLoading }] =
    api.endpoints.login.useMutation()
  const navigate = useNavigate()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()
    try {
      await login({ email, password }).unwrap()
      setEmail('')
      setPassword('')
      navigate('/')
    } catch (e) {
      alert(e)
      setError((e as any).data?.detail)
    }
  }

  if (isLoginLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Login</h1>

      {error && <div>{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input type="submit" value="Login" />
      </form>

      <Link to="/send-reset-password-link">Forgot/not have password</Link>

      <button
        onClick={() => {
          throw new Error('This is a Sentry test')
        }}
      >
        Throw error
      </button>
    </div>
  )
}

export default Login
