import classNames from 'classnames'
import get from 'lodash/get'
import { FC, ReactElement } from 'react'
import { FieldError, useFormContext } from 'react-hook-form'
import styles from './FormInputError.module.scss'

const FormInputError: FC<{ children: ReactElement; name?: string }> = ({
  children,
  name,
}) => {
  const methods = useFormContext()

  const error = get(methods.formState.errors, name ?? children.props.name) as
    | FieldError
    | undefined

  return (
    <div className={styles.container}>
      <div className={classNames(styles.inputWrapper, error && styles.isError)}>
        {children}
      </div>
      {error && <div className={styles.errorMessage}>{error?.message}</div>}
    </div>
  )
}

export default FormInputError
