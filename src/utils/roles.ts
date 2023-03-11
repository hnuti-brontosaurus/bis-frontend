import { RoleCategory, RoleSlug, User } from 'app/services/bisTypes'
import {
  adminAccessRoles,
  canCreateEventForOtherOrganizersRoles,
  canEditOldEventRoles,
  organizerAccessRoles,
} from 'config/roles'
import { cloneDeep, intersection } from 'lodash'

export type AccessSlug = 'organizer' | 'admin' | 'user'

export type AccessConfig = {
  slug: AccessSlug
  name: string
  url: string
  external?: boolean
  roles?: RoleCategory[]
}

const accessConfigs: Record<AccessSlug, AccessConfig> = {
  admin: { slug: 'admin', name: 'Administrace', url: '/admin', external: true },
  organizer: { slug: 'organizer', name: 'Organizátor/ka', url: '/org' },
  user: { slug: 'user', name: 'Uživatel/ka', url: '/user' },
}

const getUserRoleSlugs = (user: Pick<User, 'roles'>): RoleSlug[] =>
  user.roles.map(role => role.slug as RoleSlug)

const getUserAdminRoles = (user: Pick<User, 'roles'>): RoleCategory[] =>
  user.roles.filter(role => adminAccessRoles.includes(role.slug))

const getUserOrganizerRoles = (user: Pick<User, 'roles'>): RoleCategory[] =>
  user.roles.filter(role => organizerAccessRoles.includes(role.slug))

export const hasUserAdminAccess = (user: Pick<User, 'roles'>): boolean =>
  intersection(getUserRoleSlugs(user), adminAccessRoles).length > 0

export const hasUserOrganizerAccess = (user: Pick<User, 'roles'>): boolean =>
  intersection(getUserRoleSlugs(user), organizerAccessRoles).length > 0

export const canUserSaveEventForOtherOrganizer = (
  user: Pick<User, 'roles'>,
): boolean =>
  intersection(getUserRoleSlugs(user), canCreateEventForOtherOrganizersRoles)
    .length > 0

export const canUserSaveOldEvent = (user: Pick<User, 'roles'>): boolean =>
  intersection(getUserRoleSlugs(user), canEditOldEventRoles).length > 0

export const getUserAccessOptions = (
  user: Pick<User, 'roles'>,
): AccessSlug[] => {
  const slugs: AccessSlug[] = []

  if (hasUserAdminAccess(user)) slugs.push('admin')
  if (hasUserOrganizerAccess(user)) slugs.push('organizer')
  else slugs.push('user')

  return slugs
}

export const getUserDefaultAccess = (user: Pick<User, 'roles'>): AccessSlug =>
  hasUserOrganizerAccess(user) ? 'organizer' : 'user'

export const getUserAccesses = (user: Pick<User, 'roles'>) =>
  getUserAccessOptions(user).map(access => {
    const config = cloneDeep(accessConfigs[access])

    if (access === 'admin') config.roles = getUserAdminRoles(user)
    if (access === 'organizer') config.roles = getUserOrganizerRoles(user)

    return config
  })
