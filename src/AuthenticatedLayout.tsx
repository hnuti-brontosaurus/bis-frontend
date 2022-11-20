import { FC, ReactNode } from 'react'
import { useAppSelector } from './app/hooks'
import SystemMessages from './features/systemMessage/SystemMessages'
import { selectShowHeader } from './features/ui/uiSlice'
import Header from './Header'
import { Content, Footer, Header as LayoutHeader, Layout } from './Layout'
import LinkFooter from './LinkFooter'

const AuthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const showHeader = useAppSelector(selectShowHeader)
  return (
    <Layout page>
      {showHeader && (
        <LayoutHeader>
          <Header />
        </LayoutHeader>
      )}
      <Content>{children}</Content>
      {showHeader && (
        <Footer>
          <LinkFooter />
        </Footer>
      )}
      <SystemMessages />
    </Layout>
  )
}

export default AuthenticatedLayout
