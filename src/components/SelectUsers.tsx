import { skipToken } from '@reduxjs/toolkit/dist/query'
import { forwardRef, InputHTMLAttributes, useMemo } from 'react'
import Select from 'react-select'
import { api } from '../app/services/bis'
import { User } from '../app/services/testApi'
import { useDebouncedState } from '../hooks/debouncedState'
import { useQueries } from '../hooks/queries'

type SelectMultiProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: number[]
  onChange: (newValues: number[]) => void
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
          onChange={val => onChange(val.map(v => Number(v.value)))}
        />
      </>
    )
  },
)

type SelectProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: number | null | undefined
  onChange: (value: number | null | undefined) => void
}

export const SelectUser = forwardRef<any, SelectProps>(
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

    const { data: selectedUser, isLoading: isSelectedUserLoading } =
      api.endpoints.getUser.useQuery(value ? { id: value } : skipToken)

    const transform = (user: User) => ({
      label: user.display_name,
      value: user.id,
    })

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
          defaultValue={{ label: '', value: '' }}
          onChange={val => onChange(val ? Number(val.value) : null)}
        />
      </>
    )
  },
)

export default SelectUsers
