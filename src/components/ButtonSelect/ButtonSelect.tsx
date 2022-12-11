import classNames from 'classnames'
import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import styles from './ButtonSelect.module.scss'

interface ButtonSelectProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode
  id: string
}

export const ButtonSelect = forwardRef(
  (
    { id, label, ...rest }: ButtonSelectProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <>
        <input
          type="radio"
          id={id}
          ref={ref}
          {...rest}
          className={styles.input}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </>
    )
  },
)

export const ButtonSelectGroup = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={classNames(styles.group, className)}>{children}</div>
}
