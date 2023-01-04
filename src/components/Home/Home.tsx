import illustration from 'assets/happy-earth-TODO-replace-with-original.webp'
import classNames from 'classnames'
import { useAllowedToCreateEvent } from 'hooks/useAllowedToCreateEvent'
import { ReactNode } from 'react'
import { Link, To } from 'react-router-dom'
import styles from './Home.module.scss'

export interface HomeButtonConfig {
  title: string
  detail: ReactNode
  link: To
  theme: 'createEvent' | 'editEvent' | 'closeEvent' | 'opportunities' | 'simple'
}

export const Home = ({ buttons }: { buttons: HomeButtonConfig[] }) => {
  const [canAddEvent] = useAllowedToCreateEvent()

  return (
    <div className={styles.container}>
      <nav className={styles.mainMenu}>
        {buttons.map(({ title, detail, link, theme }) => (
          <Link
            to={canAddEvent || theme !== 'createEvent' ? link : ''}
            key={title}
            className={classNames(
              styles.menuItem,
              styles[theme],
              !canAddEvent && theme === 'createEvent' && styles.disabled,
            )}
          >
            <header className={styles.title}>{title}</header>
            <div className={styles.detail}>{detail}</div>
          </Link>
        ))}
      </nav>
      <img className={styles.illustration} src={illustration} alt="" />
    </div>
  )
}
