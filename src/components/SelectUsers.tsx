import { yupResolver } from '@hookform/resolvers/yup'
import {
  EndpointDefinitions,
  FetchBaseQueryError,
  QueryDefinition,
  skipToken,
} from '@reduxjs/toolkit/dist/query'
import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import { QueryHooks } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { Actions, FormInputError } from 'components'
import { forwardRef, InputHTMLAttributes, Ref, useMemo } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import Select from 'react-select'
import { Assign } from 'utility-types'
import * as yup from 'yup'
import { Button } from '.'
import { api, PaginatedList } from '../app/services/bis'
import { User, UserSearch } from '../app/services/bisTypes'
import { useDebouncedState } from '../hooks/debouncedState'
import { useQueries } from '../hooks/queries'
import { useReadUnknownAndFullUsers } from '../hooks/readUnknownAndFullUsers'
import BirthdayInput, { birthdayValidation } from './BirthdayInput'

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

type SelectObjectsProps<T> = Omit<
  Assign<
    InputHTMLAttributes<HTMLInputElement>,
    {
      value?: T[]
      onChange: (value: readonly T[]) => void
    }
  >,
  'defaultValue'
>
/**
 * This component expects - and provides - not only user ids, but array of full users as value
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

type SelectObjectProps<T> = Omit<
  Assign<
    InputHTMLAttributes<HTMLInputElement>,
    {
      value?: T
      onChange: (value: T | null) => void
      getDisabled?: (value: T) => string
      getLabel?: (value: T) => string
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

/**
 * This component searches in all users, and if current user doesn't have access, they have to provide birthdate
 */
export const SelectUnknownUser = forwardRef<
  any,
  SelectObjectProps<UserSearch | User> & {
    onBirthdayError?: (message: string) => void
  }
>(
  (
    { value, onChange, getDisabled, getLabel, onBirthdayError, ...rest },
    ref,
  ) => {
    const [searchQuery, debouncedSearchQuery, setSearchQuery] =
      useDebouncedState(1000, '')
    const { data: userOptions, isLoading: isOptionsLoading } =
      useReadUnknownAndFullUsers(
        debouncedSearchQuery.length >= 2
          ? {
              search: debouncedSearchQuery,
            }
          : skipToken,
      )

    const [readUserByBirthday] =
      api.endpoints.readUserByBirthdate.useLazyQuery()

    const readFullUser = useReadFullUser()

    return (
      <Select<UserSearch | User>
        {...rest}
        isLoading={searchQuery !== debouncedSearchQuery || isOptionsLoading}
        ref={ref}
        isClearable
        options={userOptions ? userOptions : []}
        inputValue={searchQuery}
        onInputChange={input => setSearchQuery(input)}
        value={value}
        onChange={async user => {
          if (!user) return onChange(user)
          if ('id' in user) return onChange(user)
          try {
            const fullUser = await readFullUser(user)
            if (getDisabled && getDisabled(fullUser)) {
              throw new Error(getDisabled(fullUser))
            }
            return onChange(fullUser)
          } catch (error) {
            if (error instanceof Error) onBirthdayError?.(error.message)
            else onBirthdayError?.('Jiná chyba')
          }
        }}
        isOptionDisabled={user => Boolean(getDisabled?.(user))}
        getOptionLabel={
          getLabel ?? (user => user.display_name + ('id' in user ? '' : ' ?'))
        }
      />
    )
  },
)

const birthdayValidationSchema: yup.ObjectSchema<{
  birthday: string
}> = yup.object({ birthday: birthdayValidation.required() })

export const BirthdayForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (birthday: string) => void
  onCancel: () => void
}) => {
  const methods = useForm<{ birthday: string }>({
    resolver: yupResolver(birthdayValidationSchema),
  })

  const { handleSubmit, control } = methods

  const handleFormSubmit = handleSubmit(data => {
    onSubmit(data.birthday)
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleFormSubmit}
        onReset={e => {
          e.preventDefault()
          onCancel()
        }}
      >
        <FormInputError>
          <Controller
            control={control}
            name="birthday"
            render={({ field }) => <BirthdayInput {...field} />}
          />
        </FormInputError>
        <Actions>
          <Button type="reset">Zruš</Button>
          <Button success type="submit">
            Pokračuj
          </Button>
        </Actions>
      </form>
    </FormProvider>
  )
}

/**
 * This component expects - and provides - not only user ids, but array of full users as value
 */
export const SelectUnknownUsers = forwardRef<
  any,
  SelectObjectsProps<User | UserSearch> & {
    onBirthdayError?: (message: string) => void
  }
>(({ value, onChange, onBirthdayError, ...rest }, ref) => {
  const [searchQuery, debouncedSearchQuery, setSearchQuery] = useDebouncedState(
    1000,
    '',
  )
  const { data: userOptions, isLoading: isOptionsLoading } =
    useReadUnknownAndFullUsers(
      debouncedSearchQuery.length >= 2
        ? {
            search: debouncedSearchQuery,
          }
        : skipToken,
    )

  const readFullUser = useReadFullUser()

  return (
    <Select
      {...rest}
      isLoading={searchQuery !== debouncedSearchQuery || isOptionsLoading}
      ref={ref}
      isMulti
      isClearable={false}
      options={userOptions ?? []}
      inputValue={searchQuery}
      onInputChange={input => setSearchQuery(input)}
      value={value}
      onChange={async users => {
        console.log(users)
        // first, find the user without id (unknown)
        const userIndex = users.findIndex(user => !('id' in user))
        const user = users[userIndex]
        if (!user) return onChange([...users])

        try {
          const fullUser = await readFullUser(user)
          const updatedUsers = [...users] as User[]
          updatedUsers[userIndex] = fullUser
          return onChange(updatedUsers)
        } catch (e) {
          if (e instanceof Error) onBirthdayError?.(e.message)
          else {
            onBirthdayError?.('Jiná chyba')
          }
        }
      }}
      getOptionLabel={user => user.display_name + ('id' in user ? '' : ' ?')}
      getOptionValue={user => String(user._search_id)}
    />
  )
})

const useReadFullUser = () => {
  const [readUserByBirthday] = api.endpoints.readUserByBirthdate.useLazyQuery()
  return async (user: UserSearch): Promise<User> => {
    try {
      const birthday = (await new Promise((resolve, reject) => {
        confirmAlert({
          customUI: ({ title, message, onClose }) => {
            return (
              <div>
                <header>{title}</header>
                <div>{message}</div>
                <BirthdayForm
                  onSubmit={birthday => {
                    resolve(birthday)
                    onClose()
                  }}
                  onCancel={() => {
                    resolve('')
                    onClose()
                  }}
                />
              </div>
            )
          },
          title: 'Zadej datum narození',
          message: user.display_name,
        })
      })) as string
      if (birthday) {
        const fullUser = await readUserByBirthday({
          ...user,
          birthday,
        }).unwrap()
        if (fullUser._search_id === user._search_id) {
          return fullUser
        }
        throw new Error('Nesprávné datum narození')
      }
    } catch (error) {
      if (
        error &&
        'status' in error &&
        (error as FetchBaseQueryError).status === 404
      )
        throw new Error('Nesprávné datum narození')
      throw error
    }
    throw new Error('How did we get here?')
  }
}
