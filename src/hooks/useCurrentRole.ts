import { useAppDispatch, useAppSelector } from 'app/hooks'
import { actions, selectCurrentRole } from 'features/auth/authSlice'
import { RoleSlug } from 'utils/helpers'

export const useCurrentRole = () => {
  const role = useAppSelector(selectCurrentRole)
  const dispatch = useAppDispatch()
  const setRole = (role: RoleSlug) => dispatch(actions.setRole(role))
  const setInitialRole = (role: RoleSlug) =>
    dispatch(actions.setInitialRole(role))

  return [role, setRole, setInitialRole] as const
}
