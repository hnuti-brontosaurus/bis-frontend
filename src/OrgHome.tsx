import { Link } from 'react-router-dom'
import styles from './OrgHome.module.scss'

const OrgHome = () => (
  <div>
    <nav className={styles.mainMenu}>
      <Link to="nova-akce">Nová akce</Link>
      <Link to="upravit-akci">Upravit akci</Link>
      <Link to="po-akci">Po akci</Link>
      <Link to="rozcestnik">Rozcestník</Link>
    </nav>

    <img src="asdf.txt" alt="" />
  </div>
)

export default OrgHome
