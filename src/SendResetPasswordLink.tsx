import classnames from 'classnames'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from './app/services/bis'
import styles from './Login.module.scss'

const requiredMessage = 'Toto pole je povinné!' // TODO DRY!

const SendResetPasswordLink = () => {
  const [error, setError] = useState('')
  const [sendResetPasswordLink, { isLoading, isSuccess }] =
    api.endpoints.sendResetPasswordLink.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>()

  const handleFormSubmit = handleSubmit(async data => {
    try {
      await sendResetPasswordLink(data).unwrap()
    } catch (e) {
      setError((e as any).data?.detail)
      alert(JSON.stringify(e))
    }
  })

  if (isLoading) {
    return <div className={styles.loginContainer}>Sending</div>
  }

  if (isSuccess) {
    return (
      <div className={styles.loginContainer}>Success. Check your email.</div>
    )
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <form onSubmit={handleFormSubmit}>
          <header className={styles.formHeader}>
            Send reset password link
          </header>
          <section>
            Provide your email and we'll send you an email with further steps
          </section>
          {error && <div>{error}</div>}
          <input
            className={classnames(
              styles.formElement,
              errors.email && styles.error,
            )}
            type="text"
            placeholder="E-mail"
            {...register('email', {
              required: requiredMessage,
              pattern: {
                message: 'Zadejte email',
                // https://stackoverflow.com/a/24980411 quite random regex
                // TODO needs to be replaced with django-rest-framework version or something else better than this
                value:
                  /^[^<>()[\]\\,;:\%#^\s@\"$&!@]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}))$/,
              },
            })}
          />
          {errors.email?.message}
          <input
            className={styles.formElement}
            type="submit"
            value="Přihlásit se"
          />
        </form>
      </div>
    </div>
  )
}

export default SendResetPasswordLink
