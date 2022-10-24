import { Link } from 'react-router-dom'
import styles from './Home.module.scss'

const Home = () => (
  <div>
    <nav className={styles.mainMenu}>
      <Link to="/org/akce/vytvorit">Nová akce</Link>
      <Link to="/org/akce/aktualni">Upravit akci</Link>
      <Link to="/org/akce/nevyplnene">Po akci</Link>
      <Link to="/org/prilezitosti">Rozcestník</Link>
    </nav>

    <img src="asdf.txt" alt="" />
  </div>
)

export default Home
