// inspired by https://stackoverflow.com/a/24979148

import classNames from 'classnames'
import { ReactNode } from 'react'
import styles from './Layout.module.scss'

interface ChildrenProps {
  children?: ReactNode
}

export const Layout = ({ children }: ChildrenProps) => {
  return <div className={styles.box}>{children}</div>
}

export const Header = ({ children }: ChildrenProps) => (
  <div className={classNames(styles.row, styles.header)}>{children}</div>
)

export const Content = ({ children }: ChildrenProps) => (
  <div className={classNames(styles.row, styles.content)}>{children}</div>
)

export const Footer = ({ children }: ChildrenProps) => (
  <div className={classNames(styles.row, styles.footer)}>{children}</div>
)
