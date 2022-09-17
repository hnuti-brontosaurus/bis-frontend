import classnames from 'classnames'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from './app/services/bis'
import styles from './Login.module.scss'

const ResetPassword = () => {
  // use search parameters
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''
  const [resetPassword, { isLoading }] =
    api.endpoints.resetPassword.useMutation()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<{ password: string; passwordRepeat: string }>()

  const handleFormSubmit = handleSubmit(async data => {
    try {
      await resetPassword({
        password: data.password,
        email,
        code,
      }).unwrap()
      navigate('/')
    } catch (error) {
      alert(error)
    }
  })

  if (isLoading) return <>Processing...</>

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formContainer}>
        <form onSubmit={handleFormSubmit}>
          <input
            className={classnames(
              styles.formElement,
              errors.password && styles.error,
            )}
            type="password"
            placeholder="new password"
            {...register('password', { required: 'empty!!!' })}
          />
          {errors.password?.message}
          <input
            className={classnames(
              styles.formElement,
              errors.passwordRepeat && styles.error,
            )}
            type="password"
            placeholder="repeat password"
            {...register('passwordRepeat', {
              validate: pwd => getValues('password') === pwd || 'not the same',
            })}
          />
          {errors.passwordRepeat?.message}
          <input
            className={styles.formElement}
            type="submit"
            value="set new password"
          />
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
