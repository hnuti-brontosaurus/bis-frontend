import classNames from 'classnames'
import { ReactNode } from 'react'
import styles from './SpeechBubble.module.scss'

interface SpeechBubbleProps {
  hideTail?: boolean
  className?: string
  children?: ReactNode
}

export const SpeechBubble = (props: SpeechBubbleProps) => {
  return (
    <div
      className={classNames(
        styles.bubbleRectangle,
        props.hideTail && styles.hideTail,
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
