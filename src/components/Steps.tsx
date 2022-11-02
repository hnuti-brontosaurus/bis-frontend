import classNames from 'classnames'
import has from 'lodash/has'
import { Children, FC, FunctionComponentElement, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import formStyles from '../Form.module.scss'
import { useSearchParamsState } from '../hooks/searchParamsState'
import styles from './Steps.module.scss'

export const Steps: FC<{
  children:
    | FunctionComponentElement<{
        name: string
        fields?: string[]
        hidden?: boolean
      }>[]
    | FunctionComponentElement<{
        name: string
        fields?: string[]
        hidden?: boolean
      }>
}> = ({ children }) => {
  const [step, setStep] = useSearchParamsState('krok', 1, i => Number(i))
  const elementProps = Children.map(children, element => ({
    name: element.props.name,
    errors: element.props.fields ?? [],
    hidden: element.props.hidden,
  })).filter(element => !element.hidden)
  const methods = useFormContext()

  const hasErrors = (errors: string[]): boolean =>
    errors.some(error => has(methods.formState.errors, error))

  return (
    <div>
      <nav className={styles.navigation}>
        {elementProps.map(({ name: title, errors }, i) => (
          <button
            type="button"
            className={classNames(
              i + 1 === step && styles.isActive,
              styles.stepButton,
              hasErrors(errors) && styles.isError,
            )}
            key={i}
            onClick={() => setStep(i + 1)}
          >
            {title}
          </button>
        ))}
      </nav>
      {Children.map(children, (element, i) => (
        <div className={classNames(i !== step - 1 && styles.isHidden)}>
          {element}
        </div>
      ))}
      <nav className={styles.bottomNavigation}>
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)}>
            <FaAngleLeft fontSize="5em" />
          </button>
        )}
        <span className={styles.spacer}></span>
        {step < elementProps.length && (
          <button type="button" onClick={() => setStep(step + 1)}>
            <FaAngleRight fontSize="5em" />
          </button>
        )}
      </nav>
    </div>
  )
}

export const Step: FC<{
  name: string
  fields?: string[]
  children: ReactNode
  hidden?: boolean
}> = ({ children }) => <>{children}</>

export const SimpleSteps = <T extends Record<string, any>>({
  children,
  actions,
  onSubmit,
}: {
  onSubmit?: (props: T) => void
  actions?: { name: ReactNode; props: T }[]
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
        <nav className={styles.actions}>
          {onSubmit &&
            actions &&
            actions.map(({ props, name }) => (
              <button
                type="submit"
                className={formStyles.mainActionButton}
                onClick={() => onSubmit(props)}
              >
                {name}
              </button>
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
          <button type="button" onClick={() => setStep(step - 1)}>
            <FaAngleLeft fontSize="5em" />
          </button>
        )}
        <span className={styles.spacer}></span>
        {step < elementProps.length && (
          <button type="button" onClick={() => setStep(step + 1)}>
            <FaAngleRight fontSize="5em" />
          </button>
        )}
      </nav>
    </div>
  )
}

export const SimpleStep: FC<{
  name: string
  hasError?: boolean
  fields?: string[]
  children?: ReactNode
  hidden?: boolean
}> = ({ children }) => <>{children}</>
