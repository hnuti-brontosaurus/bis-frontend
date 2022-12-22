import type { HomeButtonConfig } from 'components'
import { Home as HomeNav } from 'components'
import { useTitle } from 'hooks/title'

const buttons: HomeButtonConfig[] = [
  {
    title: 'Moje akce',
    detail: '',
    link: '/akce/zucastnene',
    theme: 'createEvent',
  },
  {
    title: 'Můj profil',
    detail: '',
    link: '/profil',
    theme: 'editEvent',
  },
  {
    title: 'Členství',
    detail: '',
    link: '',
    theme: 'simple',
  },
  {
    title: 'Dárcovství',
    detail: '',
    link: '',
    theme: 'simple',
  },
]

export const Home = () => {
  useTitle('Uživatelský přístup')
  return <HomeNav buttons={buttons} />
}
