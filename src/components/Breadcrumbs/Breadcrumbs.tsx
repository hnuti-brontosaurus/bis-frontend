import { MdOutlineKeyboardArrowRight } from 'react-icons/md'
import { Link, useLocation, useParams } from 'react-router-dom'
import styles from './Breadcrumbs.module.scss'

export const Breadcrumbs = ({
  eventToClone,
  eventName,
  opportunityName,
}: {
  title?: string
  eventToClone?: string
  eventName?: string
  opportunityName?: string
}) => {
  // if we want the route show in breadcrumbs, we need to add it to this array
  // path: path we want to link to
  // name: link name we want to show to the user
  const routes = [
    {
      path: '/send-reset-password-link',
      name: 'Akce',
    },
    { path: '/org', name: 'Organizátor' },

    {
      path: '/send-reset-password-link',
      name: 'Akce',
    },
    { path: '/login', name: 'Akce' },
    { path: '/reset_password', name: 'Akce' },
    { path: '/org/akce', name: 'Akce' },
    {
      path: '/org/akce/vytvorit',
      name: eventToClone ? `Nová akce podle: ${eventToClone}` : 'Nová akce',
    },
    {
      path: '/org/akce/:eventId',
      name: eventName,
    },
    {
      path: '/org/akce/:eventId/upravit',
      name: 'Upravit',
    },
    {
      path: '/org/akce/:eventId/uzavrit',
      name: 'Uzavřít',
    },
    {
      path: '/org/prilezitosti',
      name: 'Příležitosti',
    },
    {
      path: '/org/prilezitosti/:opportunityId',
      name: opportunityName,
    },
    {
      path: '/org/prilezitosti/:opportunityId/upravit',
      name: 'Upravit',
    },
    {
      path: '/akce',
      name: 'Akce',
    },
    {
      path: '/akce/:eventId',
      name: eventName,
    },
  ]

  const location = useLocation()
  const params: any = useParams()

  let crumbs = routes
    // Swap out any dynamic routes with their param values.
    // E.g. "/akce/:eventId" will become "/akce/246"
    .map(({ path, ...rest }) => ({
      path:
        params && Object.keys(params).length
          ? Object.keys(params).reduce((path, param) => {
              return path.replace(`:${param}`, params[param])
            }, path)
          : path,
      ...rest,
    }))

  // Get all routes that the current one starts with
  crumbs = crumbs.filter(({ path }) => location.pathname.search(path) === 0)
  // sort breadcrums by path, so we show links from more general to more specific
  crumbs.sort((a, b) => (a.path.length >= b.path.length ? 1 : -1))

  return (
    <div className={styles.container}>
      {crumbs.map((crumb, key) =>
        key + 1 === crumbs.length ? (
          <span key={key}>{crumb.name}</span>
        ) : (
          <>
            <Link className={styles.link} key={key} to={crumb.path}>
              {crumb.name}
            </Link>
            <MdOutlineKeyboardArrowRight />
          </>
        ),
      )}
    </div>
  )
}
