import classNames from 'classnames'
import { ButtonHTMLAttributes } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styles from './Button.module.scss'

interface ButtonProps {
  success?: boolean
  danger?: boolean
}

/**
 * A react-router-dom Link styled to look like button
 */
export const ButtonLink = ({
  children,
  className,
  success,
  danger,
  ...props
}: LinkProps & ButtonProps) => {
  return (
    <Link
      className={classNames(
        className,
        styles.button,
        success && styles.success,
        danger && styles.danger,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

/**
 * A button, styled
 */
export const Button = ({
  children,
  className,
  success,
  danger,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps) => {
  return (
    <button
      className={classNames(
        className,
        styles.button,
        success && styles.success,
        danger && styles.danger,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
