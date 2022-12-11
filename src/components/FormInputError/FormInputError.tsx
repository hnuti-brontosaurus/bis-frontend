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

export const FormInputError = <T extends FieldValues>({
  children,
  name,
  formMethods,
  isBlock,
  className,
}: {
  children: ReactElement
  name?: string
  formMethods?: UseFormReturn<T>
  isBlock?: boolean
  className?: string
}) => {
  const defaultMethods = useFormContext()

  const methods = formMethods ?? defaultMethods

  const error =
    methods && methods.formState
      ? (get(methods.formState.errors, name ?? children.props.name) as
          | FieldError
          | undefined)
      : undefined

  return (
    <div
      className={classNames(
        isBlock ? styles.blockContainer : styles.container,
        className,
      )}
    >
      <div className={classNames(styles.inputWrapper, error && styles.isError)}>
        {children}
      </div>
      <div className={styles.errorMessage}>{error?.message ?? <>&nbsp;</>}</div>
    </div>
  )
}
