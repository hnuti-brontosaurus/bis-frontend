import classNames from 'classnames'
import { HTMLAttributes, HTMLProps, ReactNode } from 'react'
import styles from './FormLayout.module.scss'
import Help from './Help'

export const FormNumberedHeader = ({
  children,
  required,
  help,
}: {
  children: ReactNode
  required?: boolean
  help?: ReactNode
}) => {
  return (
    <header className={classNames(styles.header, required && styles.required)}>
      {help && <Help>{help}</Help>} {children}
    </header>
  )
}

export const FormSubheader = ({
  children,
  required,
  help,
}: {
  children: ReactNode
  required?: boolean
  help?: ReactNode
}) => {
  return (
    <header className={classNames(required && styles.required)}>
      {help && <Help>{help}</Help>} {children}
    </header>
  )
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
}: {
  children: ReactNode
  header: ReactNode
  help?: ReactNode
  required?: boolean
}) => {
  return (
    <div className={styles.subsection}>
      <FormNumberedHeader required={required} help={help}>
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
}: {
  children: ReactNode
  header: ReactNode
  help?: ReactNode
  required?: boolean
}) => {
  return (
    <div className={styles.subsection}>
      <FormSubheader required={required} help={help}>
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
