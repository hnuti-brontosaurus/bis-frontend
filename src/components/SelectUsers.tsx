import { yupResolver } from '@hookform/resolvers/yup'
import { FetchBaseQueryError, skipToken } from '@reduxjs/toolkit/dist/query'
import { api } from 'app/services/bis'
import { User, UserSearch } from 'app/services/bisTypes'
import {
  Actions,
  BirthdayInput,
  birthdayValidation,
  FormInputError,
} from 'components'
import modalStyles from 'components/StyledModal/StyledModal.module.scss'
import { useDebouncedState } from 'hooks/debouncedState'
import { useReadUnknownAndFullUsers } from 'hooks/readUnknownAndFullUsers'
import { forwardRef, InputHTMLAttributes } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import Select from 'react-select'
import { Assign } from 'utility-types'
import * as yup from 'yup'
import { Button } from '.'

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
export const SelectFullUsers = forwardRef<any, SelectObjectsProps<User>>(
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

export type SelectObjectProps<T> = Omit<
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
export const SelectFullUser = forwardRef<any, SelectObjectProps<User>>(
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
        isOptionDisabled={user => Boolean(getDisabled?.(user))}
        getOptionLabel={getLabel ?? (user => user.display_name)}
      />
    )
  },
)

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
              <div className={modalStyles.modal}>
                <div className={modalStyles.content}>
                  <header className={modalStyles.modalTitleBox}>{title}</header>
                  <div className={modalStyles.modalFormBox}>
                    <div className={modalStyles.infoBox}>{message}</div>
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
                </div>
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
        typeof error === 'object' &&
        'status' in error &&
        (error as FetchBaseQueryError).status === 404
      )
        throw new Error('Nesprávné datum narození')
      throw error
    }
    throw new Error('How did we get here?')
  }
}
