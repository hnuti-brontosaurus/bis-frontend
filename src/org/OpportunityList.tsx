import { Menu, MenuButton, MenuItem } from '@szhsin/react-menu'
import classNames from 'classnames'
import { FaPlus } from 'react-icons/fa'
import { TbDotsVertical } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { api } from '../app/services/bis'
import formStyles from '../Form.module.scss'
import { useCurrentUser } from '../hooks/currentUser'
import { useRemoveOpportunity } from '../hooks/removeOpportunity'
import styles from './OpportunityList.module.scss'

const OpportunityList = () => {
  const { data: currentUser } = useCurrentUser()
  // it's safe to assume that the user is already loaded
  const userId = currentUser!.id
  const { data: opportunities } = api.endpoints.readOpportunities.useQuery({
    userId,
    page: 1,
    pageSize: 10000,
  })
  const [removeOpportunity, { isLoading: isOpportunityRemoving }] =
    useRemoveOpportunity()
  return (
    <div>
      <header className={styles.header}>
        <h1>Příležitosti</h1>
        <Link to="/org/prilezitosti/vytvorit">
          <button
            className={classNames(
              formStyles.actionButton,
              styles.headerActionButton,
            )}
          >
            <FaPlus />
            Nová příležitost
          </button>
        </Link>
      </header>
      <div>
        <table>
          <thead>
            <tr>
              <th>Název</th>
              <th>Kategorie</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {opportunities &&
              opportunities.results.map(opportunity => (
                <tr key={opportunity.id}>
                  <td>
                    <Link to={`/org/prilezitosti/${opportunity.id}`}>
                      {opportunity.name}
                    </Link>
                  </td>
                  <td>{opportunity.category.name}</td>
                  <td>
                    <Menu
                      menuButton={
                        <MenuButton>
                          <TbDotsVertical />
                        </MenuButton>
                      }
                    >
                      <MenuItem>
                        <Link
                          to={`/org/prilezitosti/${opportunity.id}/upravit`}
                        >
                          upravit
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <button
                          disabled={isOpportunityRemoving}
                          onClick={() =>
                            removeOpportunity({
                              id: opportunity.id,
                              userId,
                              name: opportunity.name,
                            })
                          }
                        >
                          smazat
                        </button>
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OpportunityList
