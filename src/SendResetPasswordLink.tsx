import { default as classNames, default as classnames } from 'classnames'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { api } from './app/services/bis'
import FormInputError from './components/FormInputError'
import formStyles from './Form.module.scss'
import styles from './Login.module.scss'

const requiredMessage = 'Toto pole je povinné!' // TODO DRY!

const SendResetPasswordLink = () => {
  const [error, setError] = useState('')
  const [sendResetPasswordLink, { isLoading, isSuccess }] =
    api.endpoints.sendResetPasswordLink.useMutation()

  const formMethods = useForm<{ email: string }>()
  const { register, handleSubmit } = formMethods

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
        <FormProvider {...formMethods}>
          <form onSubmit={handleFormSubmit}>
            <header className={styles.title}>Send reset password link</header>
            <p className={styles.subtitle}>
              Provide your email and we'll send you an email
              <br />
              with further steps
            </p>
            {error && <div>{error}</div>}
            <FormInputError isBlock>
              <input
                className={classnames(styles.formElement)}
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
            </FormInputError>
            <input
              className={classNames(
                styles.formElement,
                formStyles.mainActionButton,
              )}
              type="submit"
              value="Odeslat"
            />
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default SendResetPasswordLink
