import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { ReactNode } from 'react'

const Error = ({
  error,
  children,
}: {
  children?: ReactNode
  error?: FetchBaseQueryError | SerializedError
}) => {
  return (
    <div>
      <div>Něco se pokazilo...</div>
      {children}
    </div>
  )
}

export default Error
