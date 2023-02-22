import classNames from 'classnames'
import { LoadingIcon } from 'components'
import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styles from './Button.module.scss'

interface ButtonProps {
  primary?: boolean
  danger?: boolean
  secondary?: boolean
  tertiary?: boolean
  isLoading?: boolean
  disabled?: boolean
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
 * <a> Link styled to look like button
 */
export const ExternalButtonLink = ({
  children,
  className,
  primary,
  danger,
  secondary,
  tertiary,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & ButtonProps) => {
  return (
    <a
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
    </a>
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
  disabled,
  isLoading,
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
        (isLoading || disabled) && styles.disabled,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
      {isLoading && <LoadingIcon className={styles.icon} size={40} />}
    </button>
  )
}
