import {
  EndpointDefinitions,
  QueryDefinition,
  skipToken,
} from '@reduxjs/toolkit/dist/query'
import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import { QueryHooks } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { forwardRef, InputHTMLAttributes, Ref, useMemo } from 'react'
import Select from 'react-select'
import { Assign } from 'utility-types'
import { api, PaginatedList } from '../app/services/bis'
import { User } from '../app/services/bisTypes'
import { useDebouncedState } from '../hooks/debouncedState'
import { useQueries } from '../hooks/queries'

type SelectUsersProps = Omit<
  Assign<
    InputHTMLAttributes<HTMLInputElement>,
    {
      value?: User[]
      onChange: (value: readonly User[]) => void
    }
  >,
  'defaultValue'
>
/**
 * This component expects - and provides - not only user id, but full user as value
 */
export const SelectFullUsers = forwardRef<any, SelectUsersProps>(
  ({ value, onChange, ...rest }, ref) => {
    const [searchQuery, debouncedSearchQuery, setSearchQuery] =
      useDebouncedState(1000, '')
    const { data: userOptions, isLoading: isOptionsLoading } =
      api.endpoints.readUsers.useQuery(
        debouncedSearchQuery.length >= 2
          ? {
              search: debouncedSearchQuery,
            }
          : skipToken,
      )

    return (
      <Select
        {...rest}
        isLoading={isOptionsLoading}
        ref={ref}
        isMulti
        isClearable
        options={userOptions ? userOptions.results : []}
        inputValue={searchQuery}
        onInputChange={input => setSearchQuery(input)}
        value={value}
        onChange={onChange}
        getOptionLabel={user => user.display_name}
        getOptionValue={user => String(user.id)}
      />
    )
  },
)

type SelectMultiProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: string[]
  onChange: (newValues: string[]) => void
}

const SelectUsers = forwardRef<any, SelectMultiProps>(
  ({ value = [], onChange, ...rest }, ref) => {
    const [searchQuery, debouncedSearchQuery, setSearchQuery] =
      useDebouncedState(1000, '')
    const { data: userOptions, isFetching: isOptionsLoading } =
      api.endpoints.readUsers.useQuery(
        debouncedSearchQuery.length >= 2
          ? {
              search: debouncedSearchQuery,
            }
          : skipToken,
      )

    const selectedUsersQueries = useQueries(
      api.endpoints.getUser,
      useMemo(
        () =>
          value.map(id => ({
            id,
          })),
        [value],
      ),
    )

    const transform = (user: User) => ({
      label: user.display_name,
      value: user.id,
    })

    const selectedUsers = selectedUsersQueries.map(query => query.data)

    if (selectedUsers.some(user => !user)) return <div>Loading</div>

    return (
      <>
        <Select
          {...rest}
          ref={ref}
          isLoading={isOptionsLoading}
          isMulti
          options={
            userOptions
              ? userOptions?.results?.map(user => transform(user))
              : []
          }
          inputValue={searchQuery}
          onInputChange={input => setSearchQuery(input)}
          value={(selectedUsers as User[]).map(user => transform(user))}
          defaultValue={undefined}
          onChange={val => onChange(val.map(v => v.value))}
        />
      </>
    )
  },
)

type SelectUserProps = Omit<
  Assign<
    InputHTMLAttributes<HTMLInputElement>,
    {
      value?: User
      onChange: (value: User | null) => void
      getDisabled?: (value: User) => boolean
      getLabel?: (value: User) => string
    }
  >,
  'defaultValue'
>

/**
 * This component expects - and provides - not only user id, but full user as value
 */
export const SelectFullUser = forwardRef<any, SelectUserProps>(
  ({ value, onChange, getDisabled, getLabel, ...rest }, ref) => {
    const [searchQuery, debouncedSearchQuery, setSearchQuery] =
      useDebouncedState(1000, '')
    const { data: userOptions, isLoading: isOptionsLoading } =
      api.endpoints.readUsers.useQuery(
        debouncedSearchQuery.length >= 2
          ? {
              search: debouncedSearchQuery,
            }
          : skipToken,
      )

    return (
      <Select<User>
        {...rest}
        isLoading={isOptionsLoading}
        ref={ref}
        isClearable
        options={userOptions ? userOptions.results : []}
        inputValue={searchQuery}
        onInputChange={input => setSearchQuery(input)}
        value={value}
        onChange={onChange}
        isOptionDisabled={getDisabled}
        getOptionLabel={getLabel ?? (user => user.display_name)}
      />
    )
  },
)

type SelectProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: string | null | undefined
  onChange: (
    value: string | { value: string; label: string } | null | undefined,
  ) => void
  transform?: (user: User) => {
    label: string
    value: string
    disabled?: boolean
  }
  fullData?: boolean
}

export const SelectUser = forwardRef<any, SelectProps>(
  ({ value, onChange, fullData, transform: transformProp, ...rest }, ref) => {
    const [searchQuery, debouncedSearchQuery, setSearchQuery] =
      useDebouncedState(1000, '')
    const { data: userOptions, isLoading: isOptionsLoading } =
      api.endpoints.readUsers.useQuery(
        debouncedSearchQuery.length >= 2
          ? {
              search: debouncedSearchQuery,
            }
          : skipToken,
      )

    const { data: selectedUser, isLoading: isSelectedUserLoading } =
      api.endpoints.getUser.useQuery(value ? { id: value } : skipToken)

    const transform =
      transformProp ??
      ((user: User): { label: string; value: string; disabled?: boolean } => ({
        label: user.display_name,
        value: user.id,
      }))

    return (
      <>
        <Select
          {...rest}
          isLoading={isOptionsLoading}
          ref={ref}
          isClearable
          options={
            userOptions
              ? userOptions?.results?.map(user => transform(user))
              : []
          }
          inputValue={searchQuery}
          onInputChange={input => setSearchQuery(input)}
          value={
            value && selectedUser && !isSelectedUserLoading
              ? transform(selectedUser)
              : { label: '', value: '' }
          }
          defaultValue={
            { label: '', value: '' } as {
              label: string
              value: string
              disabled?: boolean
            }
          }
          onChange={val =>
            onChange(
              val
                ? fullData
                  ? { value: val.value, label: val.label }
                  : val.value
                : null,
            )
          }
          isOptionDisabled={({ disabled }) => Boolean(disabled)}
        />
      </>
    )
  },
)

export const SelectByQuery = <
  ReturnType,
  QOne extends QueryDefinition<{ id: number }, any, any, ReturnType, any>,
  QMany extends QueryDefinition<
    { search: string },
    any,
    any,
    PaginatedList<ReturnType>,
    any
  >,
  D extends EndpointDefinitions,
>({
  value,
  onChange,
  queryRead,
  querySearch,
  transform,
  customRef: ref,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value?: number | null | undefined
  onChange: (value: number | null | undefined) => void
  queryRead: ApiEndpointQuery<QOne, D> & QueryHooks<QOne>
  querySearch: ApiEndpointQuery<QMany, D> & QueryHooks<QMany>
  transform: (item: ReturnType) => { value: number; label: string }
  customRef?: Ref<any>
}) => {
  const [searchQuery, debouncedSearchQuery, setSearchQuery] = useDebouncedState(
    1000,
    '',
  )
  const { data: options, isLoading: isOptionsLoading } = querySearch.useQuery(
    (debouncedSearchQuery.length >= 2
      ? {
          search: debouncedSearchQuery,
        }
      : skipToken) as unknown as any,
  )

  const { data: selectedItem, isLoading: isSelectedItemLoading } =
    queryRead.useQuery((value ? { id: value } : skipToken) as unknown as any)

  return (
    <>
      <Select
        {...rest}
        isLoading={isOptionsLoading}
        ref={ref}
        isClearable
        options={
          options ? options?.results?.map(option => transform(option)) : []
        }
        inputValue={searchQuery}
        onInputChange={input => setSearchQuery(input)}
        value={
          value && selectedItem && !isSelectedItemLoading
            ? transform(selectedItem)
            : { label: '', value: '' }
        }
        defaultValue={{ label: '', value: '' }}
        onChange={val => onChange(val ? Number(val.value) : null)}
      />
    </>
  )
}

// export const SelectByQuery = forwardRef<any, any>({ value, onChange })

export default SelectUsers
