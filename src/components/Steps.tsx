import classNames from 'classnames'
import { Children, FC, FunctionComponentElement, ReactNode } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { useSearchParamsState } from '../hooks/searchParamsState'
import styles from './Steps.module.scss'

export const Steps: FC<{
  children:
    | FunctionComponentElement<{
        name: string
      }>[]
    | FunctionComponentElement<{
        name: string
      }>
}> = ({ children }) => {
  const [step, setStep] = useSearchParamsState('krok', 1, i => Number(i))
  const titles = Children.map(children, element => element.props.name)
  return (
    <div>
      <nav>
        {titles.map((title, i) => (
          <button
            type="button"
            className={classNames(
              i + 1 === step && styles.isActive,
              styles.stepButton,
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
        {step < titles.length && (
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
  children: ReactNode
}> = ({ name, children }) => <>{children}</>
