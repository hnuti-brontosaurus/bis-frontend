import { Actions, ButtonLink, Error } from 'components'
import { useCurrentUser } from 'hooks/currentUser'
import { isOrganizer } from 'utils/helpers'

export const NotFound = () => {
  const { data: currentUser } = useCurrentUser()
  return (
    <Error status={404} message="Tady nic není…">
      TODO let's put here something nice
      <Actions>
        Pokračuj na
        {currentUser && isOrganizer(currentUser) && (
          <ButtonLink success to="/org">
            organizátorský přístup
          </ButtonLink>
        )}
        <ButtonLink success to="/user">
          uživatelský přístup
        </ButtonLink>
      </Actions>
    </Error>
  )
}
