import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { ReactNode } from 'react'
import styles from './Error.module.scss'

export const Error = ({
  error,
  children,
  message,
}: {
  children?: ReactNode
  error?: FetchBaseQueryError | SerializedError
  message?: string
}) => {
  let name = 'Něco se pokazilo...'
  let status: number | undefined

  if (message) {
    name = message
  } else if (error && 'status' in error) {
    switch (error.status) {
      case 404:
        status = 404
        name = 'Objekt nenalezen'
        break
      case 500:
        status = 500
        name = 'Chyba serveru'
        break
      default:
        break
    }
  }
  return (
    <div className={styles.container}>
      {status && <div className={styles.status}>{status}</div>}
      <div className={styles.message}>{name}</div>
      {children}
    </div>
  )
}
