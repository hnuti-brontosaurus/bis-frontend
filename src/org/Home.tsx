import { Link } from 'react-router-dom'
import styles from './Home.module.scss'

const Home = () => (
  <div>
    <nav className={styles.mainMenu}>
      <Link to="akce/vytvorit">Nová akce</Link>
      <Link to="akce/aktualni">Upravit akci</Link>
      <Link to="akce/nevyplnene">Po akci</Link>
      <Link to="rozcestnik">Rozcestník</Link>
    </nav>

    <img src="asdf.txt" alt="" />
  </div>
)

export default Home
