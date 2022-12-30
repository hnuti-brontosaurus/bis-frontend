import classNames from 'classnames'
import { ButtonHTMLAttributes } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styles from './Button.module.scss'

interface ButtonProps {
  primary?: boolean
  danger?: boolean
  secondary?: boolean
  tertiary?: boolean
}

/**
 * A react-router-dom Link styled to look like button
 */
export const ButtonLink = ({
  children,
  className,
  primary,
  danger,
  secondary,
  tertiary,
  ...props
}: LinkProps & ButtonProps) => {
  return (
    <Link
      className={classNames(
        className,
        styles.button,
        primary && styles.primary,
        danger && styles.danger,
        secondary && styles.secondary,
        tertiary && styles.tertiary,
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
  primary,
  danger,
  secondary,
  tertiary,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps) => {
  return (
    <button
      className={classNames(
        className,
        styles.button,
        primary && styles.primary,
        danger && styles.danger,
        secondary && styles.secondary,
        tertiary && styles.tertiary,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
