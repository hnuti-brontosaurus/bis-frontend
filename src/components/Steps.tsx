import classNames from 'classnames'
import has from 'lodash/has'
import { Children, FC, FunctionComponentElement, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { useSearchParamsState } from '../hooks/searchParamsState'
import styles from './Steps.module.scss'

export const Steps: FC<{
  children:
    | FunctionComponentElement<{
        name: string
        fields?: string[]
      }>[]
    | FunctionComponentElement<{
        name: string
        fields?: string[]
      }>
}> = ({ children }) => {
  const [step, setStep] = useSearchParamsState('krok', 1, i => Number(i))
  const elementProps = Children.map(children, element => ({
    name: element.props.name,
    errors: element.props.fields ?? [],
  }))
  const methods = useFormContext()

  const hasErrors = (errors: string[]): boolean =>
    errors.some(error => has(methods.formState.errors, error))

  return (
    <div>
      <nav>
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
}> = ({ children }) => <>{children}</>
