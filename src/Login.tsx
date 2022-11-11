import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { default as classNames, default as classnames } from 'classnames'
import { FormProvider, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { api } from './app/services/bis'
import FormInputError from './components/FormInputError'
import Loading from './components/Loading'
import TogglePasswordInput from './components/TogglePasswordInput'
import formStyles from './Form.module.scss'
import styles from './Login.module.scss'
import { required } from './utils/validationMessages'

const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError,
): string => {
  if ('status' in error) {
    if (error.status === 400 || error.status === 401)
      return 'Problém s vaším přihlášením, zadejte prosím správné uživatelské jméno a heslo.'
    else if (error.status === 500) {
      return 'Byl problém s přihlášením. Prosím zkuste to znovu.'
    } else if (error.status === 429) {
      return 'Příliš mnoho neúspěšných pokusů o přihlášení k vašemu účtu. Před opětovným přihlášením musíte počkat 1 hodinu.'
    }
  }
  return 'Nepodařilo se přihlásit'
}

const Login = () => {
  const [login, { isLoading: isLoginLoading, error }] =
    api.endpoints.login.useMutation()

  const formMethods = useForm<{ email: string; password: string }>()
  const { register, handleSubmit } = formMethods

  const handleFormSubmit = handleSubmit(async data => {
    await login(data).unwrap()
    // AuthenticatedOutlet should take care of the rest...
  })

  if (isLoginLoading)
    return <Loading hideHeader>Přihlášení do panelu Brontosaurus...</Loading>

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <header className={styles.title}>Přihlaste se ke svému účtu</header>
        <p className={styles.subtitle}>
          Zadejte své přihlašovací jméno a heslo <br />
          pro přístup k aplikaci
        </p>
        {error && (
          <div className={classNames(styles.error, styles.formElement)}>
            {getErrorMessage(error)}
          </div>
        )}
        <FormProvider {...formMethods}>
          <form onSubmit={handleFormSubmit}>
            <FormInputError isBlock>
              <input
                className={styles.formElement}
                type="text"
                placeholder="E-mail"
                {...register('email', {
                  required,
                })}
              />
            </FormInputError>
            <FormInputError isBlock>
              <TogglePasswordInput
                className={styles.formElement}
                placeholder="Heslo"
                {...register('password', { required })}
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
              style={{ marginTop: '1.5rem' }}
              className={classnames(
                styles.formElement,
                formStyles.actionButton,
                formStyles.alternativeActionButton,
              )}
              to="/send-reset-password-link"
            >
              Nemám / Zapomněl jsem heslo
            </Link>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default Login
