import { FC, ReactNode } from 'react'
import { useAppSelector } from './app/hooks'
import logo from './assets/logo.png'
import { selectShowHeader } from './features/ui/uiSlice'
import { Content, Footer, Header, Layout } from './Layout'

const UnauthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const showHeader = useAppSelector(selectShowHeader)
  return (
    <Layout>
      {showHeader && (
        <Header>
          <img src={logo} alt="Brontosaurus logo" />
        </Header>
      )}
      <Content>{children}</Content>
      <Footer></Footer>
    </Layout>
  )
}

export default UnauthenticatedLayout
