import { useState } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { required } from 'utils/validationMessages'
import styles from './NumberInput.module.scss'

export const NumberInput = ({
  register,
  setValue,
  getValues,
  name,
  ...props
}: any) => {
  const [inputValue, setInputValue] = useState<number>(getValues(name))
  return (
    <div className={styles.container}>
      <div
        className={styles.button}
        onClick={() => {
          setInputValue(prev => {
            setValue(name, Math.max(prev - 1, props.min))
            return Math.max(prev - 1, props.min)
          })
        }}
      >
        <FaMinus />
      </div>
      <input
        className={styles.input}
        type={'number'}
        {...register(name, {
          required,
          valueAsNumber: true,
        })}
        value={inputValue.toString()}
      />
      <div
        className={styles.button}
        onClick={() => {
          setInputValue(prev => {
            setValue(name, prev + 1)
            return prev + 1
          })
        }}
      >
        <FaPlus />
      </div>
    </div>
  )
}
