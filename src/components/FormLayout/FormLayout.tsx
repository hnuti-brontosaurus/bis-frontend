import classNames from 'classnames'
import { Help, Web } from 'components'
import { HTMLAttributes, HTMLProps, ReactNode } from 'react'
import styles from './FormLayout.module.scss'

interface HeaderProps {
  children: ReactNode
  required?: boolean
  help?: ReactNode
  onWeb?: boolean
}

export const FormHeader = ({
  children,
  required,
  help,
  onWeb,
  numbered,
}: HeaderProps & {
  numbered?: boolean
}) => {
  return (
    <header className={classNames(numbered && styles.header)}>
      {help && <Help>{help}</Help>}{' '}
      <span className={classNames(required && styles.required)}>
        {children}
      </span>{' '}
      {onWeb && <Web />}
    </header>
  )
}

export const FormNumberedHeader = (props: HeaderProps) => {
  return <FormHeader {...props} numbered />
}

export const FormSubheader = (props: HeaderProps) => {
  return <FormHeader {...props} />
}

export const FormSection = ({
  children,
  startIndex,
}: {
  children: ReactNode
  startIndex?: number
}) => {
  return (
    <fieldset
      style={{ counterReset: `section ${(startIndex ?? 1) - 1}` }}
      className={styles.section}
    >
      {children}
    </fieldset>
  )
}

export const FormSubsection = ({
  children,
  header,
  help,
  required,
  onWeb,
}: {
  children: ReactNode
  header: ReactNode
  help?: ReactNode
  required?: boolean
  onWeb?: boolean
}) => {
  return (
    <div className={styles.subsection}>
      <FormNumberedHeader required={required} help={help} onWeb={onWeb}>
        {header}
      </FormNumberedHeader>
      {children}
    </div>
  )
}

export const FormSubsubsection = ({
  children,
  header,
  help,
  required,
  onWeb,
}: {
  children: ReactNode
  header: ReactNode
  help?: ReactNode
  required?: boolean
  onWeb?: boolean
}) => {
  return (
    <div className={styles.subsection}>
      <FormSubheader required={required} help={help} onWeb={onWeb}>
        {header}
      </FormSubheader>
      {children}
    </div>
  )
}

export const InfoBox = ({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames(styles.infoBox, className)} {...rest}>
    {children}
  </div>
)

export const Label = ({
  children,
  className,
  required,
  ...rest
}: HTMLProps<HTMLLabelElement> & { required?: boolean }) => (
  <label
    {...rest}
    className={classNames(required && styles.required, className)}
  >
    {children}
  </label>
)

export const FullSizeElement = ({ children }: HTMLProps<HTMLDivElement>) => (
  <div className={styles.fullSize}>{children}</div>
)

export const InlineSection = ({ children }: HTMLProps<HTMLDivElement>) => (
  <div className={styles.inline}>{children}</div>
)

export const Actions = ({ children }: HTMLProps<HTMLElement>) => (
  <nav className={styles.actions}>{children}</nav>
)
