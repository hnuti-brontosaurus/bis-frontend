import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { useAppDispatch } from 'app/hooks'
import { useCallback, useEffect } from 'react'
import { actions, SystemMessage } from './systemMessageSlice'

/**
 * This hooks returns function which we can use to show messages
 *
 * Usage:
 * const showMessage = useShowMessage()
 * // in some logic
 * showMessage({ message: 'Some message', detail: 'Optional detail', type: 'success' })
 */
export const useShowMessage = () => {
  const dispatch = useAppDispatch()

  const showMessage = useCallback(
    (message: Pick<SystemMessage, 'type' | 'message' | 'detail'>) => {
      const id = globalThis.crypto.randomUUID()

      const msg = { ...message, id, time: Date.now() }
      dispatch(actions.addMessage(msg))

      return msg
    },
    [dispatch],
  )

  return showMessage
}

/**
 * Given error from rtk-query (or probably fetch), and optional message, this displays the error message
 *
 * Usage:
 * const { data, ...state } = api.endpoints.endpoint.useQuery()
 * useShowApiErrorMessage(state.error, 'Displayed error message')
 */
export const useShowApiErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
  message = 'Něco se nepovedlo',
) => {
  const showMessage = useShowMessage()
  useEffect(() => {
    let detail = ''
    if (error && 'status' in error) {
      detail += error.status

      if ('data' in error) {
        if ('detail' in (error.data as any))
          detail += ' ' + (error.data as any).detail
        else detail += '\n' + JSON.stringify(error.data, null, 2)
      }
    }
    if (error)
      showMessage({
        message,
        detail,
        type: 'error',
      })
  }, [error, message, showMessage])
}
