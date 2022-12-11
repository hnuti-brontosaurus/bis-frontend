import { NotFound } from 'pages/NotFound'

/*
This component leaves the react app and goes to the same url
*/
export const AdminRedirect = () => {
  // prevent infinite redirect loop
  if (globalThis.document.referrer === globalThis.location.href)
    return <NotFound />

  // eslint-disable-next-line no-self-assign
  globalThis.location.href = globalThis.location.href

  return null
}
