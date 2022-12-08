import { skipToken } from '@reduxjs/toolkit/query'
import classNames from 'classnames'
import { Actions, Button, ButtonLink, Loading } from 'components'
import { sanitize } from 'dompurify'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../app/services/bis'
import { useCurrentUser } from '../hooks/currentUser'
import { useRemoveOpportunity } from '../hooks/removeOpportunity'
import { formatDateRange } from '../utils/helpers'
import styles from './ViewEvent.module.scss'

const ViewOpportunity = () => {
  const params = useParams()
  const opportunityId = Number(params.opportunityId)
  const { data: user } = useCurrentUser()
  const userId = user!.id

  const navigate = useNavigate()

  const {
    data: opportunity,
    isLoading: isOpportunityLoading,
    isError,
  } = api.endpoints.readOpportunity.useQuery({ id: opportunityId, userId })
  const { data: location } = api.endpoints.readLocation.useQuery(
    opportunity?.location
      ? {
          id: opportunity.location,
        }
      : skipToken,
  )

  const [removeOpportunity, { isLoading: isOpportunityRemoving }] =
    useRemoveOpportunity()

  if (isError) return <>Nepodařilo se nám najít příležitost</>

  if (isOpportunityLoading || !opportunity)
    return <Loading>Stahujeme příležitost</Loading>

  if (isOpportunityRemoving) return <Loading>Mažeme příležitost</Loading>

  const handleClickRemove = async () => {
    await removeOpportunity({ ...opportunity, userId })
    navigate('..')
  }

  return (
    <div className={classNames(styles.wrapper, 'opportunitySection')}>
      <header className={styles.name}>{opportunity.name}</header>
      <Actions>
        <ButtonLink success to={`/org/prilezitosti/${opportunityId}/upravit`}>
          upravit
        </ButtonLink>
        <Button danger onClick={handleClickRemove}>
          smazat
        </Button>
      </Actions>
      <div className={styles.infoBoxDetail}>
        <div className={styles.imageWrapper}>
          <img className={styles.image} src={opportunity.image.medium} alt="" />
          <div className={styles.tags}>
            <div className={styles.tag}>{opportunity.category.name}</div>
          </div>
        </div>
        <table>
          <tbody>
            <tr>
              <th>Datum</th>
              <td>{formatDateRange(opportunity.start, opportunity.end)}</td>
            </tr>
            <tr>
              <th>Místo</th>
              <td>{location?.name}</td>
            </tr>
            <tr>
              <th>Kontaktní osoba</th>
              <td>
                <div>{opportunity.contact_name}</div>
                <div>{opportunity.contact_phone}</div>
                <div>{opportunity.contact_email}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={styles.invitationTexts}>
        <header>Představení příležitosti</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(opportunity.introduction),
          }}
        />
        <header>Popis činnosti</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(opportunity.description),
          }}
        />
        <header>Přínos pro lokalitu</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(opportunity.location_benefits ?? ''),
          }}
        />
        <header>Co mi to přinese?</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(opportunity.personal_benefits),
          }}
        />
        <header>Co potřebuji ke spolupráci</header>
        <section
          dangerouslySetInnerHTML={{
            __html: sanitize(opportunity.requirements),
          }}
        />
      </div>
      <pre className={styles.data}>
        {JSON.stringify(opportunity, null, '  ')}
      </pre>
    </div>
  )
}

export default ViewOpportunity
