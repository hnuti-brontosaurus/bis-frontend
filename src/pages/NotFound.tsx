import { Error } from 'components'

const NotFound = () => (
  <Error status={404} message="Tady nic není…">
    Sorry, this page doesn't exist.
    <br />
    TODO let's put here something nice, and some meaningful link
  </Error>
)

export default NotFound
