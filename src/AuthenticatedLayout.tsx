import { FC, ReactNode } from 'react'
import { useAppSelector } from './app/hooks'
import { selectShowHeader } from './features/ui/uiSlice'
import Header from './Header'
import { Content, Footer, Header as LayoutHeader, Layout } from './Layout'

const AuthenticatedLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const showHeader = useAppSelector(selectShowHeader)
  return (
    <Layout>
      {showHeader && (
        <LayoutHeader>
          <Header />
        </LayoutHeader>
      )}
      <Content>{children}</Content>
      <Footer></Footer>
    </Layout>
  )
}

export default AuthenticatedLayout
