import classNames from 'classnames'
import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import styles from './IconSelect.module.scss'

interface IconSelectProps extends InputHTMLAttributes<HTMLInputElement> {
  text: string
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
  id: string
}

export const IconSelect = forwardRef(
  (
    { text, icon, id, ...rest }: IconSelectProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const Icon = icon
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
          <div>
            <div className={styles.icon}>
              <Icon fill="#fff" height={60} width={60} />
            </div>
          </div>
          <span>{text}</span>
        </label>
      </>
    )
  },
)

export const IconSelectGroup = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={classNames(styles.group, className)}>{children}</div>
}
