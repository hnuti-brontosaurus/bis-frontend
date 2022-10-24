import { default as classNames, default as classnames } from 'classnames'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from './app/services/bis'
import FormInputError from './components/FormInputError'
import formStyles from './Form.module.scss'
import styles from './Login.module.scss'

const ResetPassword = () => {
  // use search parameters
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''
  const [resetPassword, { isLoading }] =
    api.endpoints.resetPassword.useMutation()

  const formMethods = useForm<{ password: string; passwordRepeat: string }>()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = formMethods
  const handleFormSubmit = handleSubmit(async data => {
    try {
      await resetPassword({
        password: data.password,
        email,
        code,
      }).unwrap()
      navigate('/')
    } catch (error) {
      alert(JSON.stringify(error))
    }
  })

  if (isLoading) return <>Processing...</>

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <FormProvider {...formMethods}>
          <form onSubmit={handleFormSubmit}>
            <FormInputError isBlock>
              <input
                className={classnames(
                  styles.formElement,
                  errors.password && styles.error,
                )}
                type="password"
                placeholder="new password"
                {...register('password', { required: 'empty!!!' })}
              />
            </FormInputError>
            <FormInputError isBlock>
              <input
                className={classnames(
                  styles.formElement,
                  errors.passwordRepeat && styles.error,
                )}
                type="password"
                placeholder="repeat password"
                {...register('passwordRepeat', {
                  validate: pwd =>
                    getValues('password') === pwd || 'not the same',
                })}
              />
            </FormInputError>
            <input
              className={classNames(
                styles.formElement,
                formStyles.mainActionButton,
              )}
              type="submit"
              value="Potvrdit"
            />
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default ResetPassword
