import { useAppDispatch, useAppSelector } from 'app/hooks'
import { ReactComponent as HiddenOwl } from 'assets/hiddenOwl.svg'
import { ReactComponent as Owl } from 'assets/owl.svg'
import classNames from 'classnames'
import { SpeechBubble } from 'components/SpeechBubble/SpeechBubble'
import { actions, selectInfoMessageVisibility } from 'features/ui/uiSlice'
import { ReactNode, useEffect, useState } from 'react'
import { IoMdCloseCircle } from 'react-icons/io'
import styles from './GuideOwl.module.scss'

interface GuideOwlProps {
  children: ReactNode
  id: string
}

export const GuideOwl = ({ children, id }: GuideOwlProps) => {
  const [animating, setAnimating] = useState(false)
  const [animatingOwl, setAnimatingOwl] = useState(false)

  const show = useAppSelector(state => selectInfoMessageVisibility(state, id))

  const dispatch = useAppDispatch()
  const setShow = (show: boolean) =>
    dispatch(actions.toggleInfoMessage({ show, id }))

  useEffect(() => {
    if (!animating) {
      return
    }
    const timeout = setTimeout(() => {
      setAnimating(false)
      setShow(true)
    }, 800)

    return () => clearTimeout(timeout)
  }, [animating])

  useEffect(() => {
    if (!animatingOwl) {
      return
    }
    const timeout = setTimeout(() => {
      setAnimatingOwl(false)
    }, 1800)

    return () => clearTimeout(timeout)
  }, [animatingOwl])
  return (
    <>
      <div className={classNames(styles.guideOwl, styles.desktopContainer)}>
        {show ? (
          <>
            <SpeechBubble
              className={classNames(
                styles.bubble,
                animatingOwl ? styles.animatingOwl : '',
              )}
            >
              {children}
            </SpeechBubble>
            <Owl
              className={classNames(
                styles.owl,
                animatingOwl ? styles.animatingOwl : '',
              )}
            />
            <div
              className={classNames(
                styles.close,
                animatingOwl ? styles.animatingOwl : '',
              )}
              onClick={() => setShow(false)}
            >
              <IoMdCloseCircle size={24} />
            </div>
          </>
        ) : (
          <div
            className={classNames(
              styles.hiddenOwlContainer,
              !show ? styles.hidden : '',
              animating ? styles.animating : '',
            )}
            onClick={() => {
              setAnimating(true)
              setAnimatingOwl(true)
            }}
          >
            <HiddenOwl className={styles.hiddenOwl} />
          </div>
        )}
      </div>
      <div className={styles.mobileContainer}>
        {show ? (
          <>
            <SpeechBubble className={styles.mobileBubble} hideTail>
              {children}{' '}
              <div
                className={styles.mobileBubbleClose}
                onClick={() => setShow(false)}
              >
                <IoMdCloseCircle size={24} />
              </div>
            </SpeechBubble>
          </>
        ) : (
          <div
            className={classNames(
              styles.hiddenOwlContainer,
              !show ? styles.hidden : '',
              animating ? styles.animating : '',
            )}
            onClick={() => {
              setAnimating(true)
              setAnimatingOwl(true)
            }}
          >
            <HiddenOwl className={styles.hiddenOwl} />
          </div>
        )}
      </div>
    </>
  )
}
