import { FC, ReactNode } from 'react'
import logo from './assets/logo.png'
import styles from './UnauthenticatedLayout.module.scss'

const UnauthenticatedLayout: FC<{ isLogo?: boolean; children: ReactNode }> = ({
  isLogo = true,
  children,
}) => {
  return (
    <div className={styles.container}>
      {isLogo && (
        <header className={styles.header}>
          <img src={logo} alt="Brontosaurus logo" />
        </header>
      )}
      {children}
    </div>
  )
}

export default UnauthenticatedLayout
