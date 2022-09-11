import { FormEventHandler, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from './app/services/bis'

const ResetPassword = () => {
  // use search parameters
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [resetPassword, { isLoading }] =
    api.endpoints.resetPassword.useMutation()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()

    if (password !== passwordRepeat) {
      alert('different passwords')
    }
    try {
      await resetPassword({
        email,
        password,
        code,
      }).unwrap()
      navigate('/')
    } catch (error) {
      alert(error)
    }
  }

  if (isLoading) return <>Processing...</>

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="new password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="repeat password"
          value={passwordRepeat}
          onChange={e => setPasswordRepeat(e.target.value)}
        />
        <input type="submit" value="set new password" />
      </form>
    </div>
  )
}

export default ResetPassword
