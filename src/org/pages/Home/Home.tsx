import type { HomeButtonConfig } from 'components'
import { Home as HomeNav } from 'components'
import { useTitle } from 'hooks/title'

const buttons: HomeButtonConfig[] = [
  {
    title: 'Nová akce',
    detail: '',
    link: '/org/akce/vytvorit',
    theme: 'createEvent',
  },
  {
    title: 'Upravit akci',
    detail: '',
    link: '/org/akce/aktualni',
    theme: 'editEvent',
  },
  {
    title: 'Po akci',
    detail: 'Evidence a účastníci akce',
    link: '/org/akce/nevyplnene',
    theme: 'closeEvent',
  },
  {
    title: 'Rozcestník',
    detail: 'Nabídnout příležitosti',
    link: '/org/prilezitosti',
    theme: 'opportunities',
  },
]

export const Home = () => {
  useTitle('Organizátorský přístup')
  return <HomeNav buttons={buttons} />
}
