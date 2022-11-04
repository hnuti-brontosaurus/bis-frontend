import classnames from 'classnames'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { api } from './app/services/bis'
import FormInputError from './components/FormInputError'
import Loading from './components/Loading'
import formStyles from './Form.module.scss'
import styles from './Login.module.scss'

const requiredMessage = 'Toto pole je povinné!'

const Login = () => {
  const [error, setError] = useState('')
  const [login, { isLoading: isLoginLoading }] =
    api.endpoints.login.useMutation()

  const formMethods = useForm<{ email: string; password: string }>()
  const { register, handleSubmit } = formMethods

  const handleFormSubmit = handleSubmit(async data => {
    try {
      await login(data).unwrap()
      // AuthenticatedOutlet should take care of the rest...
    } catch (e) {
      alert(JSON.stringify(e))
      setError((e as any).data?.detail)
    }
  })

  if (isLoginLoading)
    return <Loading hideHeader>Přihlášení do panelu Brontosaurus...</Loading>

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <header className={styles.title}>Přihlašte se ke svému účtu</header>
        <p className={styles.subtitle}>
          Zadejte své přihlašovací jméno a heslo pro
          <br />
          přístup k aplikaci
        </p>
        {error && <div>{error}</div>}
        <FormProvider {...formMethods}>
          <form onSubmit={handleFormSubmit}>
            <FormInputError isBlock>
              <input
                className={styles.formElement}
                type="text"
                placeholder="E-mail"
                {...register('email', { required: requiredMessage })}
              />
            </FormInputError>
            <FormInputError isBlock>
              <input
                className={styles.formElement}
                type="password"
                placeholder="Heslo"
                {...register('password', { required: requiredMessage })}
              />
            </FormInputError>
            <input
              className={classnames(
                styles.formElement,
                formStyles.mainActionButton,
              )}
              type="submit"
              value="Přihlásit se"
            />

            <Link
              className={classnames(
                styles.formElement,
                formStyles.actionButton,
                formStyles.alternativeActionButton,
              )}
              to="/send-reset-password-link"
            >
              Nemám/zapomenuté heslo
            </Link>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default Login
