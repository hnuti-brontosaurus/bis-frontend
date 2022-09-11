import { FormEventHandler, useState } from 'react'
import { api } from './app/services/bis'

const SendResetPasswordLink = () => {
  const [email, setEmail] = useState('')
  const [sendResetPasswordLink, { isLoading, isSuccess, isError }] =
    api.endpoints.sendResetPasswordLink.useMutation()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()
    sendResetPasswordLink({ email })
  }

  if (isLoading) return <>Processing... (TODO)</>

  if (isSuccess) return <>Success, check your email</>

  return (
    <div>
      <h1>Send Reset Password Link</h1>
      {isError && <div>something went wrong</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input type="submit" value="send password reset link" />
      </form>
    </div>
  )
}

export default SendResetPasswordLink
