import classnames from 'classnames'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { api } from './app/services/bis'
import styles from './Login.module.scss'

const requiredMessage = 'Toto pole je povinné!'

const Login = () => {
  const [error, setError] = useState('')
  const [login, { isLoading: isLoginLoading }] =
    api.endpoints.login.useMutation()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>()

  const handleFormSubmit = handleSubmit(async data => {
    try {
      await login(data).unwrap()
      navigate('/')
    } catch (e) {
      alert(JSON.stringify(e))
      setError((e as any).data?.detail)
    }
  })

  if (isLoginLoading) return <div>Loading...</div>

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        {error && <div>{error}</div>}
        <form onSubmit={handleFormSubmit}>
          <header className={styles.formHeader}>
            Přihlašte se ke svému účtu
          </header>
          <section>
            Zadejte své přihlašovací jméno a heslo pro přístup k aplikaci
          </section>
          <input
            className={classnames(
              styles.formElement,
              errors.email && styles.error,
            )}
            type="text"
            placeholder="E-mail"
            {...register('email', { required: requiredMessage })}
          />
          {errors.email?.message}
          <input
            className={classnames(
              styles.formElement,
              errors.password && styles.error,
            )}
            type="password"
            placeholder="Heslo"
            {...register('password', { required: requiredMessage })}
          />
          {errors.password?.message}
          <input
            className={styles.formElement}
            type="submit"
            value="Přihlásit se"
          />

          <Link to="/send-reset-password-link">Forgot/not have password</Link>
        </form>
      </div>
    </div>
  )
}

export default Login
