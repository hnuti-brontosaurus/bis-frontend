import classNames from 'classnames'
import { Button } from 'components'
import { useSearchParamsState } from 'hooks/searchParamsState'
import { Children, FC, FunctionComponentElement, ReactNode } from 'react'
import { ImArrowLeft, ImArrowRight } from 'react-icons/im'
import styles from './Steps.module.scss'

export const Steps = <T extends Record<string, any>>({
  children,
  actions,
  onSubmit,
  onCancel,
}: {
  onSubmit?: (props: T) => void
  onCancel?: () => void
  actions?: { name: string; props: T }[]
  children:
    | FunctionComponentElement<{
        name: string
        hasError?: boolean
        hidden?: boolean
      }>
    | FunctionComponentElement<{
        name: string
        hasError?: boolean
        hidden?: boolean
      }>[]
}) => {
  const [step, setStep] = useSearchParamsState('krok', 1, i => Number(i))
  const elementProps = Children.map(children, element => ({
    name: element.props.name,
    hasError: element.props.hasError ?? false,
    hidden: element.props.hidden,
  })).filter(element => !element.hidden)

  return (
    <div>
      <div className={styles.navWrapper}>
        <nav className={styles.navigation}>
          {elementProps.map(({ name, hasError }, i) => (
            <button
              type="button"
              className={classNames(
                i + 1 === step && styles.isActive,
                styles.stepButton,
                hasError && styles.isError,
              )}
              key={i}
              onClick={() => setStep(i + 1)}
            >
              {name}
            </button>
          ))}
        </nav>
        <nav className={classNames(styles.actions, styles.topActions)}>
          {onCancel && (
            <Button secondary type="reset" onClick={() => onCancel()}>
              Zrušit
            </Button>
          )}
          {onSubmit &&
            actions &&
            actions.map(({ props, name }, i) => (
              <Button
                key={i} // TODO we should not use index as key
                primary
                type="submit"
                onClick={() => onSubmit(props)}
              >
                {name}
              </Button>
            ))}
        </nav>
      </div>
      {Children.map(children, (element, i) => (
        <div className={classNames(i !== step - 1 && styles.isHidden)}>
          {element}
        </div>
      ))}
      <nav className={styles.bottomNavigation}>
        {step > 1 && (
          <Button
            tertiary
            type="button"
            aria-label="Go to previous step"
            onClick={() => setStep(step - 1)}
          >
            <ImArrowLeft /> Krok zpatky
          </Button>
        )}
        <span className={styles.spacer}></span>
        {step < elementProps.length && (
          <Button
            tertiary
            type="button"
            aria-label="Go to next step"
            onClick={() => setStep(step + 1)}
          >
            Dalsi krok <ImArrowRight />
          </Button>
        )}
      </nav>
      <nav className={styles.actions}>
        {onCancel && (
          <Button secondary type="reset" onClick={() => onCancel()}>
            Zrušit
          </Button>
        )}
        {onSubmit &&
          actions &&
          actions.map(({ props, name }, i) => (
            <Button
              key={name}
              primary
              type="submit"
              onClick={() => onSubmit(props)}
            >
              {name}
            </Button>
          ))}
      </nav>
    </div>
  )
}

export const Step: FC<{
  name: string
  hasError?: boolean
  fields?: string[]
  children?: ReactNode
  hidden?: boolean
}> = ({ children }) => <>{children}</>
