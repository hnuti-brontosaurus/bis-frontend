import type { HomeButtonConfig } from 'components'
import { Home as HomeNav } from 'components'

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

export const Home = () => <HomeNav buttons={buttons} />
