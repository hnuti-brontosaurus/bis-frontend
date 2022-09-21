import { Link } from 'react-router-dom'
import styles from './OrgHome.module.scss'

const OrgHome = () => (
  <div>
    <nav className={styles.mainMenu}>
      <Link to="akce/vytvorit">Nová akce</Link>
      <Link to="akce/upravit">Upravit akci</Link>
      <Link to="akce/uzavrit">Po akci</Link>
      <Link to="rozcestnik">Rozcestník</Link>
    </nav>

    <img src="asdf.txt" alt="" />
  </div>
)

export default OrgHome
