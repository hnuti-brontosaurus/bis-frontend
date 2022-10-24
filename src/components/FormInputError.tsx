import classNames from 'classnames'
import get from 'lodash/get'
import { ReactElement } from 'react'
import {
  FieldError,
  FieldValues,
  useFormContext,
  UseFormReturn,
} from 'react-hook-form'
import styles from './FormInputError.module.scss'

function FormInputError<T extends FieldValues>({
  children,
  name,
  formMethods,
  isBlock,
}: {
  children: ReactElement
  name?: string
  formMethods?: UseFormReturn<T>
  isBlock?: boolean
}) {
  const defaultMethods = useFormContext()

  const methods = formMethods ?? defaultMethods

  const error = get(methods.formState.errors, name ?? children.props.name) as
    | FieldError
    | undefined

  return (
    <div
      className={classNames(isBlock ? styles.blockContainer : styles.container)}
    >
      <div className={classNames(styles.inputWrapper, error && styles.isError)}>
        {children}
      </div>
      {error ? (
        <div className={styles.errorMessage}>{error?.message}</div>
      ) : (
        <div className={styles.errorPlaceholder}></div>
      )}
    </div>
  )
}

export default FormInputError
