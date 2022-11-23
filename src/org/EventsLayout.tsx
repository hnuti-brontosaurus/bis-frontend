import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { api } from '../app/services/bis'
import ListHeader from '../components/ListHeader'
import listStyles from '../components/ListHeader.module.scss'
import Loading from '../components/Loading'
import { useCurrentUser } from '../hooks/currentUser'
import { ClearPageMargin, Content, Header, Layout } from '../Layout'

const EventsLayout = () => {
  const { data: currentUser } = useCurrentUser()

  const location = useLocation()

  const pathnameThemes = useMemo(
    () =>
      ({
        '/org/akce/aktualni': 'editEvent',
        '/org/akce/vsechny': 'editEvent',
        '/org/akce/nevyplnene': 'closeEvent',
      } as const),
    [],
  )

  const theme = pathnameThemes[location.pathname as keyof typeof pathnameThemes]

  const { data: events } = api.endpoints.readOrganizedEvents.useQuery(
    currentUser
      ? { userId: currentUser.id, page: 1, pageSize: 10000 } // fetch all and don't worry about it anymore
      : skipToken,
  )

  return (
    <ClearPageMargin style={{ height: '100%' }}>
      <Layout>
        <Header>
          <ListHeader
            header="Moje akce"
            theme={theme}
            tabs={[
              {
                key: 'aktualni',
                to: 'aktualni',
                name: 'Aktuální akce',
              },
              {
                key: 'vsechny',
                to: 'vsechny',
                name: 'Všechny akce',
              },
              {
                key: 'nevyplnene',
                to: 'nevyplnene',
                name: 'Nevyplněné akce',
              },
            ]}
            actions={[]}
          />
        </Header>
        <Content>
          {events?.results ? (
            <div className={listStyles.listContent}>
              <Outlet context={events} />
            </div>
          ) : (
            <Loading>Stahujeme akce...</Loading>
          )}
        </Content>
      </Layout>
    </ClearPageMargin>
  )
}

export default EventsLayout
