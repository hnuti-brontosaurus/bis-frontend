import { useAppDispatch } from 'app/hooks'
import { actions } from 'features/ui/uiSlice'
import { ReactNode, useEffect } from 'react'
import { RiLoader4Fill } from 'react-icons/ri'
import styles from './Loading.module.scss'

export const Loading = ({
  children,
  hideHeader,
}: {
  children: ReactNode
  hideHeader?: boolean
}) => {
  const dispatch = useAppDispatch()
  const showHeader = actions.showHeader

  // hide header, and show it again when finished
  useEffect(() => {
    if (hideHeader) {
      dispatch(showHeader(false))
      return () => {
        dispatch(showHeader(true))
      }
    }
  }, [dispatch, hideHeader, showHeader])

  return (
    <div className={styles.container}>
      <RiLoader4Fill className={styles.icon} size={40} />
      <div className={styles.message}>{children}</div>
    </div>
  )
}
