import { FC } from 'react'
import styles from './errorBox.module.scss'

type ObjectWithStrings = { [s: string]: string | ObjectWithStrings }

const arrayStringsFromObject = (obj: ObjectWithStrings) => {
  const arrayOfMessages: string[] = []

  const getToValues = (o: ObjectWithStrings) => {
    for (const key in o) {
      const currentElement = o[key]
      if (typeof currentElement !== 'string') {
        getToValues(currentElement)
      } else {
        arrayOfMessages.push(currentElement)
      }
    }
  }
  getToValues(obj)
  return arrayOfMessages
}

interface IErrorBox {
  error: ObjectWithStrings
}

const ErrorBox: FC<IErrorBox> = ({ error }) => {
  return (
    <div className={styles.infoBoxError}>
      {arrayStringsFromObject(error).map(error => (
        <div>{error}</div>
      ))}
    </div>
  )
}

export default ErrorBox
