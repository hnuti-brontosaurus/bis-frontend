import { ReactNode } from 'react'
import { useAppSelector } from './app/hooks'
import SystemMessages from './features/systemMessage/SystemMessages'
import { selectShowHeader } from './features/ui/uiSlice'
import { Content, Footer, Header, Layout } from './Layout'
import LinkFooter from './LinkFooter'
import MixedHeader from './MixedHeader'

const MixedLayout = ({ children }: { children: ReactNode }) => {
  const showHeader = useAppSelector(selectShowHeader)
  return (
    <Layout page>
      {showHeader && (
        <Header>
          <MixedHeader />
        </Header>
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

export default MixedLayout
