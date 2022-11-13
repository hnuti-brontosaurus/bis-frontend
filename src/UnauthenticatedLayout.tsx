import { FC, ReactNode } from 'react'
import { useAppSelector } from './app/hooks'
import logo from './assets/logo.png'
import { selectShowHeader } from './features/ui/uiSlice'
import styles from './Header.module.scss'
import { Content, Footer, Header, Layout } from './Layout'

const UnauthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const showHeader = useAppSelector(selectShowHeader)
  return (
    <Layout>
      {showHeader && (
        <Header>
          <div className={styles.container}>
            <img className={styles.logo} src={logo} alt="Brontosaurus logo" />
          </div>
        </Header>
      )}
      <Content>{children}</Content>
      <Footer></Footer>
    </Layout>
  )
}

export default UnauthenticatedLayout
