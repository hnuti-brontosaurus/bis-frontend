import styles from './LinkFooter.module.scss'

const LinkFooter = () => {
  return (
    <div className={styles.container}>
      <p>motivační text k darování</p>
      <nav className={styles.links}>
        <a
          href="https://eshop.brontosaurus.cz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          E-shop
        </a>
        <a
          href="https://www.darujme.cz/organizace/206"
          target="_blank"
          rel="noopener noreferrer"
        >
          Darujme
        </a>
        <a
          href="https://darkyprirode.cz/kategorie-produktu/darky-prirode/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dárky přírodě
        </a>
        <a
          href="https://mozek.brontosaurus.cz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mozek
        </a>
        <a href="" target="_blank" rel="noopener noreferrer">
          Rozcestník
        </a>
        <a
          href="https://zpetna-vazba.brontosaurus.cz/login.php"
          target="_blank"
          rel="noopener noreferrer"
        >
          Zpětná vazba
        </a>
        <a
          href="http://peceoprirodu.cz/databaze/sign/in?backlink=kgkmp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Databáze budek
        </a>
        <a href="" target="_blank" rel="noopener noreferrer">
          Newslettery
        </a>
      </nav>
    </div>
  )
}

export default LinkFooter
