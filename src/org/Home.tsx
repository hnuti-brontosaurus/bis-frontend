import classNames from 'classnames'
import { ReactNode } from 'react'
import { Link, To } from 'react-router-dom'
import illustration from '../assets/happy-earth-TODO-replace-with-original.webp'
import styles from './Home.module.scss'

const buttons: {
  title: string
  detail: ReactNode
  link: To
  theme: 'createEvent' | 'editEvent' | 'closeEvent' | 'opportunities'
}[] = [
  {
    title: 'Nová akce',
    detail: '',
    link: '/org/akce/vytvorit',
    theme: 'createEvent',
  },
  {
    title: 'Upravit akci',
    detail: '',
    link: '/org/akce/aktualni',
    theme: 'editEvent',
  },
  {
    title: 'Po akci',
    detail: 'Evidence a účastníci akce',
    link: '/org/akce/nevyplnene',
    theme: 'closeEvent',
  },
  {
    title: 'Rozcestník',
    detail: 'Nabídnout příležitosti',
    link: '/org/prilezitosti',
    theme: 'opportunities',
  },
]

const Home = () => (
  <div className={styles.container}>
    <nav className={styles.mainMenu}>
      {buttons.map(({ title, detail, link, theme }) => (
        <Link
          to={link}
          key={title}
          className={classNames(styles.menuItem, styles[theme])}
        >
          <header className={styles.title}>{title}</header>
          <div className={styles.detail}>{detail}</div>
        </Link>
      ))}
    </nav>

    <img className={styles.illustration} src={illustration} alt="" />
  </div>
)

export default Home
